"""
Game Router
Routes: POST /game/{uid}/brushing-log, GET /game/{uid}/brushing-logs,
        POST /game/{uid}/chapter-complete, POST /game/{uid}/xp,
        POST /game/{uid}/sync, POST /game/{uid}/vr-session
"""
import os
import sys
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db.init_db import get_conn
import logger as log

router = APIRouter(prefix="/game", tags=["game"])


# ── Models ────────────────────────────────────────────────
class BrushingLog(BaseModel):
    date: str
    duration: int
    quality: int
    xp: int
    gold: int

class ChapterComplete(BaseModel):
    chapterId: int
    chapterName: str
    stars: int
    score: int

class XPUpdate(BaseModel):
    xpRaw: int
    level: int
    gold: int

class GameSyncRequest(BaseModel):
    level: int
    xp: int
    gold: int
    enamel_health: int
    current_streak: int

class VRSession(BaseModel):
    duration: int
    sugarBugsCaught: int


# ── Routes ────────────────────────────────────────────────
@router.post("/{uid}/brushing-log")
def add_brushing_log(uid: str, log_data: BrushingLog):
    conn = get_conn("game")
    try:
        conn.execute("""
            INSERT INTO brushing_logs (uid, session_date, duration_seconds, quality_score, xp_earned, gold_earned)
            VALUES (?,?,?,?,?,?)
        """, (uid, log_data.date, log_data.duration, log_data.quality, log_data.xp, log_data.gold))
        conn.commit()
    finally:
        conn.close()
    log.db_log("GAME", f"Brushing log for {uid}: {log_data.duration}s", "INFO")
    return {"success": True}


@router.get("/{uid}/brushing-logs")
def get_brushing_logs(uid: str):
    conn = get_conn("game")
    try:
        rows = conn.execute(
            "SELECT * FROM brushing_logs WHERE uid=? ORDER BY created_at DESC", (uid,)
        ).fetchall()
        return {"success": True, "logs": [dict(r) for r in rows]}
    finally:
        conn.close()


@router.post("/{uid}/chapter-complete")
def chapter_complete(uid: str, req: ChapterComplete):
    conn = get_conn("game")
    try:
        conn.execute("""
            INSERT INTO chapter_progress (uid, chapter_id, chapter_name, stars_earned, score, completed)
            VALUES (?,?,?,?,?,1)
            ON CONFLICT(uid, chapter_id) DO UPDATE SET
                stars_earned = MAX(stars_earned, EXCLUDED.stars_earned),
                score = MAX(score, EXCLUDED.score),
                attempts = attempts + 1
        """, (uid, req.chapterId, req.chapterName, req.stars, req.score))
        conn.execute("UPDATE character_stats SET completed_chapters = completed_chapters + 1 WHERE uid=?", (uid,))
        conn.commit()
    finally:
        conn.close()
    log.db_log("GAME", f"Chapter {req.chapterId} completed by {uid} stars={req.stars}", "INFO")
    return {"success": True}


@router.post("/{uid}/xp")
def update_xp(uid: str, req: XPUpdate):
    conn = get_conn("game")
    try:
        conn.execute("""
            UPDATE character_stats SET xp=?, level=?, gold=?, updated_at=DATETIME('now')
            WHERE uid=?
        """, (req.xpRaw, req.level, req.gold, uid))
        conn.commit()
    finally:
        conn.close()
    log.db_log("GAME", f"XP Sync for {uid}: lv={req.level} xp={req.xpRaw}", "INFO")
    return {"success": True}


@router.post("/{uid}/sync")
def sync_game(uid: str, req: GameSyncRequest):
    """Backward-compatible game sync from monolithic main.py."""
    if not uid or uid in ("undefined", "null"):
        raise HTTPException(status_code=400, detail="Invalid UID")
    conn = get_conn("game")
    try:
        conn.execute("""
            UPDATE character_stats SET level=?, xp=?, gold=?, enamel_health=?, current_streak=?,
            updated_at=DATETIME('now') WHERE uid=?
        """, (req.level, req.xp, req.gold, req.enamel_health, req.current_streak, uid))
        conn.commit()
    finally:
        conn.close()
    log.db_log("GAME", f"Synced stats for {uid} | level={req.level} xp={req.xp}", "INFO")
    return {"success": True}


@router.post("/{uid}/vr-session")
def vr_session(uid: str, req: VRSession):
    log.db_log("GAME", f"VR Session for {uid}: {req.sugarBugsCaught} bugs caught", "INFO")
    return {"success": True, "reward_multiplier": 1.5}
