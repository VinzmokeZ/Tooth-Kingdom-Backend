"""
Rewards Router
Routes: GET /rewards/catalog, GET /rewards/{uid},
        POST /rewards/{uid}/achievement, POST /rewards/{uid}/unlock, POST /rewards/{uid}/purchase
"""
import os
import sys
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db.init_db import get_rewards_conn, get_game_conn
import logger as log

router = APIRouter(prefix="/rewards", tags=["rewards"])


class AchievementRequest(BaseModel):
    achievement_id: str
    name: Optional[str] = None
    description: Optional[str] = None
    xp_reward: Optional[int] = 50

class UnlockRewardRequest(BaseModel):
    reward_id: str
    reward_name: Optional[str] = None
    reward_type: Optional[str] = "cosmetic"

class PurchaseRequest(BaseModel):
    reward_id: str


@router.get("/catalog")
def get_catalog():
    conn = get_rewards_conn()
    try:
        rows = conn.execute("SELECT * FROM reward_catalog ORDER BY unlock_level, cost_gold").fetchall()
        return {
            "success": True,
            "catalog": [{
                "id": r["reward_id"], "name": r["name"], "description": r["description"],
                "type": r["reward_type"], "costGold": r["cost_gold"],
                "unlockLevel": r["unlock_level"], "imageKey": r["image_key"]
            } for r in rows]
        }
    finally:
        conn.close()


@router.get("/{uid}")
def get_rewards(uid: str):
    conn = get_rewards_conn()
    try:
        achievements = conn.execute(
            "SELECT * FROM achievements WHERE uid=? ORDER BY unlocked_at DESC", (uid,)
        ).fetchall()
        unlocked = conn.execute(
            "SELECT * FROM unlocked_rewards WHERE uid=? ORDER BY unlocked_at DESC", (uid,)
        ).fetchall()
        inventory = conn.execute(
            "SELECT * FROM inventory WHERE uid=? ORDER BY acquired_at DESC", (uid,)
        ).fetchall()

        return {
            "success": True,
            "achievements": [{"id": r["achievement_id"], "name": r["name"],
                               "description": r["description"], "xpReward": r["xp_reward"],
                               "unlockedAt": r["unlocked_at"]} for r in achievements],
            "unlockedRewards": [{"id": r["reward_id"], "name": r["reward_name"],
                                  "type": r["reward_type"], "unlockedAt": r["unlocked_at"]} for r in unlocked],
            "inventory": [{"id": r["item_id"], "name": r["item_name"],
                            "type": r["item_type"], "quantity": r["quantity"]} for r in inventory]
        }
    finally:
        conn.close()


@router.post("/{uid}/achievement")
def unlock_achievement(uid: str, req: AchievementRequest):
    conn = get_rewards_conn()
    game_conn = get_game_conn()
    try:
        existing = conn.execute(
            "SELECT id FROM achievements WHERE uid=? AND achievement_id=?",
            (uid, req.achievement_id)
        ).fetchone()
        if existing:
            return {"success": True, "alreadyUnlocked": True}

        conn.execute("""
            INSERT INTO achievements (uid, achievement_id, name, description, xp_reward)
            VALUES (?,?,?,?,?)
        """, (uid, req.achievement_id, req.name, req.description, req.xp_reward))
        conn.commit()

        if req.xp_reward:
            game_conn.execute("UPDATE character_stats SET xp=xp+? WHERE uid=?", (req.xp_reward, uid))
            game_conn.commit()

        log.db_log("rewards", f"Achievement [{req.achievement_id}] unlocked for {uid}: +{req.xp_reward} XP")
        return {"success": True, "alreadyUnlocked": False, "xpAwarded": req.xp_reward}
    finally:
        conn.close()
        game_conn.close()


@router.post("/{uid}/unlock")
def unlock_reward(uid: str, req: UnlockRewardRequest):
    conn = get_rewards_conn()
    try:
        conn.execute("""
            INSERT OR IGNORE INTO unlocked_rewards (uid, reward_id, reward_name, reward_type)
            VALUES (?,?,?,?)
        """, (uid, req.reward_id, req.reward_name, req.reward_type))
        conn.commit()
        log.db_log("rewards", f"Reward [{req.reward_id}] unlocked for {uid}")
        return {"success": True}
    finally:
        conn.close()


@router.post("/{uid}/purchase")
def purchase_item(uid: str, req: PurchaseRequest):
    """Buy an item from the Kingdom Bazaar using gold."""
    r_conn = get_rewards_conn()
    g_conn = get_game_conn()
    try:
        catalog_item = r_conn.execute(
            "SELECT * FROM reward_catalog WHERE reward_id=?", (req.reward_id,)
        ).fetchone()
        if not catalog_item:
            raise HTTPException(404, "Item not found in catalog")

        stats = g_conn.execute("SELECT gold, level FROM character_stats WHERE uid=?", (uid,)).fetchone()
        if not stats:
            raise HTTPException(404, "Player stats not found")

        if catalog_item["unlock_level"] > stats["level"]:
            raise HTTPException(403, f"Requires level {catalog_item['unlock_level']}")
        if stats["gold"] < catalog_item["cost_gold"]:
            raise HTTPException(400, f"Not enough gold. Need {catalog_item['cost_gold']}, have {stats['gold']}")

        g_conn.execute("UPDATE character_stats SET gold=gold-? WHERE uid=?", (catalog_item["cost_gold"], uid))
        g_conn.commit()

        r_conn.execute("""
            INSERT OR IGNORE INTO inventory (uid, item_id, item_name, item_type)
            VALUES (?,?,?,?)
        """, (uid, req.reward_id, catalog_item["name"], catalog_item["reward_type"]))
        r_conn.commit()

        log.db_log("rewards", f"Purchase: {uid} bought [{req.reward_id}] for {catalog_item['cost_gold']} gold")
        return {"success": True, "item": catalog_item["name"], "goldSpent": catalog_item["cost_gold"]}
    finally:
        r_conn.close()
        g_conn.close()
