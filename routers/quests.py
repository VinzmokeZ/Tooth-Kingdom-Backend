"""
Quests Router
Routes: GET /quests/{uid}, POST /quests/{uid}/progress, POST /quests/{uid}/complete
"""
import os
import sys
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db.init_db import get_quests_conn, get_game_conn
import logger as log

router = APIRouter(prefix="/quests", tags=["quests"])


class QuestProgressRequest(BaseModel):
    quest_id: str
    increment: Optional[int] = 1

class QuestCompleteRequest(BaseModel):
    quest_id: str


def _ensure_daily_quests(uid: str):
    """Assign today's daily quests to the user if not already assigned."""
    conn = get_quests_conn()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        quests = conn.execute("SELECT quest_id FROM quest_definitions WHERE quest_type='daily'").fetchall()
        for q in quests:
            conn.execute(
                "INSERT OR IGNORE INTO quest_progress (uid, quest_id, assigned_date) VALUES (?,?,?)",
                (uid, q["quest_id"], today)
            )
        conn.commit()
    finally:
        conn.close()


@router.get("/{uid}")
def get_quests(uid: str):
    _ensure_daily_quests(uid)
    conn = get_quests_conn()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        rows = conn.execute("""
            SELECT qp.*, qd.title, qd.description, qd.target_count, qd.xp_reward,
                   qd.gold_reward, qd.icon, qd.quest_type
            FROM quest_progress qp
            JOIN quest_definitions qd ON qp.quest_id = qd.quest_id
            WHERE qp.uid=? AND (qp.assigned_date=? OR qd.quest_type='weekly')
            ORDER BY qp.completed ASC, qd.quest_type
        """, (uid, today)).fetchall()

        active, completed = [], []
        for r in rows:
            q = {
                "questId": r["quest_id"], "title": r["title"], "description": r["description"],
                "currentCount": r["current_count"], "targetCount": r["target_count"],
                "xpReward": r["xp_reward"], "goldReward": r["gold_reward"],
                "icon": r["icon"], "type": r["quest_type"]
            }
            (completed if r["completed"] else active).append(q)

        return {"success": True, "activeQuests": active, "completedQuests": completed}
    finally:
        conn.close()


@router.post("/{uid}/progress")
def update_quest_progress(uid: str, req: QuestProgressRequest):
    conn = get_quests_conn()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        row = conn.execute("""
            SELECT qp.*, qd.target_count, qd.xp_reward, qd.gold_reward
            FROM quest_progress qp
            JOIN quest_definitions qd ON qp.quest_id = qd.quest_id
            WHERE qp.uid=? AND qp.quest_id=? AND (qp.assigned_date=? OR qd.quest_type='weekly') AND qp.completed=0
        """, (uid, req.quest_id, today)).fetchone()

        if not row:
            return {"success": True, "message": "Quest not found or already completed"}

        new_count = row["current_count"] + req.increment
        completed = new_count >= row["target_count"]

        conn.execute("""
            UPDATE quest_progress SET current_count=?, completed=?, completed_at=?
            WHERE uid=? AND quest_id=? AND assigned_date=?
        """, (new_count, 1 if completed else 0,
              datetime.now().isoformat() if completed else None,
              uid, req.quest_id, row["assigned_date"]))
        conn.commit()

        result = {"success": True, "currentCount": new_count, "completed": completed}
        if completed:
            result["xpReward"] = row["xp_reward"]
            result["goldReward"] = row["gold_reward"]
            log.db_log("quests", f"Quest [{req.quest_id}] completed by {uid}! +{row['xp_reward']} XP +{row['gold_reward']} gold")

        return result
    finally:
        conn.close()


@router.post("/{uid}/complete")
def complete_quest(uid: str, req: QuestCompleteRequest):
    conn = get_quests_conn()
    g_conn = get_game_conn()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        row = conn.execute("""
            SELECT qp.*, qd.xp_reward, qd.gold_reward
            FROM quest_progress qp
            JOIN quest_definitions qd ON qp.quest_id = qd.quest_id
            WHERE qp.uid=? AND qp.quest_id=? AND (qp.assigned_date=? OR qd.quest_type='weekly')
        """, (uid, req.quest_id, today)).fetchone()

        if not row:
            raise HTTPException(404, "Quest not found")

        if not row["completed"]:
            conn.execute("""
                UPDATE quest_progress SET completed=1, current_count=?, completed_at=datetime('now')
                WHERE uid=? AND quest_id=? AND assigned_date=?
            """, (row["target_count"], uid, req.quest_id, row["assigned_date"]))
            conn.commit()

        g_conn.execute(
            "UPDATE character_stats SET xp=xp+?, gold=gold+? WHERE uid=?",
            (row["xp_reward"], row["gold_reward"], uid)
        )
        g_conn.commit()

        log.db_log("quests", f"Quest [{req.quest_id}] rewards claimed by {uid}: +{row['xp_reward']} XP, +{row['gold_reward']} gold")
        return {"success": True, "xpEarned": row["xp_reward"], "goldEarned": row["gold_reward"]}
    finally:
        conn.close()
        g_conn.close()
