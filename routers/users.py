"""
Users Router
Routes: GET /users/{uid}, POST /users/{uid}, POST /users/{uid}/profile,
        PATCH /users/{uid}/character, PATCH /users/{uid}/settings
"""
import os
import sys
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db.init_db import get_conn
import logger as log

router = APIRouter(prefix="/users", tags=["users"])


# ── Models ────────────────────────────────────────────────
class UserDataPayload(BaseModel):
    userData: Optional[Dict[str, Any]] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class CharacterUpdate(BaseModel):
    selectedCharacter: int

class SettingsUpdate(BaseModel):
    darkMode: Optional[bool] = None
    notifications: Optional[bool] = None
    sound: Optional[bool] = None


# ── Helpers ───────────────────────────────────────────────
def _build_user_response(auth_row, game_row) -> dict:
    """Merge auth + game data into the full userData blob."""
    base = {
        "name": auth_row["name"] if auth_row else "Hero",
        "email": auth_row["email"] if auth_row else "",
        "role": auth_row["role"] if auth_row else "child",
        "phone": auth_row["phone"] if auth_row else None,
        "dob": auth_row["dob"] if auth_row else None,
        "level": 1, "xp": 0, "gold": 0, "enamelHealth": 100, "totalStars": 0,
        "selectedCharacter": 1, "currentStreak": 0, "bestStreak": 0, "totalDays": 0,
        "completedChapters": 0, "brushingLogs": {}, "completedQuestIds": [],
        "inventory": [], "unlockedRewards": [], "achievements": [],
        "questProgress": {"completedQuests": [], "activeQuests": []},
        "settings": {"darkMode": False, "notifications": True, "sound": True},
        "lastBrushedTimestamp": None,
    }
    if game_row:
        base.update({
            "level": game_row["level"],
            "xp": game_row["xp"],
            "gold": game_row["gold"],
            "enamelHealth": game_row["enamel_health"],
            "totalStars": game_row["total_stars"],
            "selectedCharacter": game_row["selected_char"],
            "currentStreak": game_row["current_streak"],
            "bestStreak": game_row["best_streak"],
            "totalDays": game_row["total_days"],
            "completedChapters": game_row["completed_chapters"],
        })
    return base


def _ensure_user_profile_exists(uid: str):
    """Create fallback profile for unknown UIDs."""
    conn = get_conn("auth")
    try:
        if not conn.execute("SELECT uid FROM users WHERE uid=?", (uid,)).fetchone():
            conn.execute("INSERT INTO users (uid, name, role) VALUES (?,?,?)",
                         (uid, "Offline Hero", "child"))
            conn.commit()
    finally:
        conn.close()

    conn2 = get_conn("game")
    try:
        conn2.execute("INSERT OR IGNORE INTO character_stats (uid) VALUES (?)", (uid,))
        conn2.commit()
    finally:
        conn2.close()


# ── Routes ────────────────────────────────────────────────
@router.get("/{uid}")
def get_user(uid: str):
    if not uid or uid in ("undefined", "null"):
        raise HTTPException(status_code=400, detail="Invalid UID")

    _ensure_user_profile_exists(uid)

    a_conn = get_conn("auth")
    g_conn = get_conn("game")
    s_conn = get_conn("social")
    try:
        auth_row = a_conn.execute("SELECT * FROM users WHERE uid=?", (uid,)).fetchone()
        game_row = g_conn.execute("SELECT * FROM character_stats WHERE uid=?", (uid,)).fetchone()

        userData = _build_user_response(auth_row, game_row)
        userData["uid"] = uid

        # Fetch notifications
        notes = s_conn.execute(
            "SELECT id, message, type, status, created_at FROM notifications WHERE receiver_uid = ? ORDER BY created_at DESC LIMIT 20",
            (uid,)
        ).fetchall()
        mapped_notes = []
        for n in notes:
            nd = dict(n)
            mapped_notes.append({
                "id": nd["id"],
                "type": nd["type"] or "reminder",
                "title": "New Message" if nd["type"] == "reminder" else "Achievement!",
                "message": nd["message"],
                "time": nd["created_at"],
                "read": nd["status"] == "read",
            })
        userData["notifications"] = mapped_notes

        log.db_log("USERS", f"Fetched profile for {uid} | Email: {userData.get('email')}", "INFO")
        return {"success": True, "userData": userData}
    finally:
        a_conn.close()
        g_conn.close()
        s_conn.close()


@router.post("/{uid}")
def save_user(uid: str, payload: UserDataPayload):
    if not uid or uid in ("undefined", "null"):
        raise HTTPException(status_code=400, detail="Invalid UID")

    _ensure_user_profile_exists(uid)
    ud = payload.userData or {}

    # Update auth info if provided
    if payload.name or payload.email:
        conn = get_conn("auth")
        try:
            conn.execute("UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE uid = ?",
                         (payload.name, payload.email, uid))
            conn.commit()
        finally:
            conn.close()

    # Update game stats
    g_conn = get_conn("game")
    try:
        g_conn.execute("""
            UPDATE character_stats SET
                level=?, xp=?, gold=?, enamel_health=?, total_stars=?,
                selected_char=?, current_streak=?, best_streak=?, total_days=?,
                completed_chapters=?, updated_at=DATETIME('now')
            WHERE uid=?
        """, (
            ud.get("level", 1), ud.get("xp", 0), ud.get("gold", 0),
            ud.get("enamelHealth", 100), ud.get("totalStars", 0),
            ud.get("selectedCharacter", 1), ud.get("currentStreak", 0),
            ud.get("bestStreak", 0), ud.get("totalDays", 0),
            ud.get("completedChapters", 0), uid
        ))
        g_conn.commit()
    finally:
        g_conn.close()

    log.db_log("USERS", f"Saved full sync for {uid}", "INFO")
    return {"success": True}


@router.post("/{uid}/profile")
def update_profile(uid: str, payload: UserDataPayload):
    """Update user profile with optional identity consolidation."""
    if not uid or uid in ("undefined", "null"):
        raise HTTPException(status_code=400, detail="Invalid UID")

    from routers.auth import consolidate_identity
    consolidate_identity(uid, payload.email, payload.phone)

    conn = get_conn("auth")
    try:
        if payload.name:
            conn.execute("UPDATE users SET name = ? WHERE uid = ?", (payload.name, uid))
        if payload.email:
            conn.execute("UPDATE users SET email = ? WHERE uid = ?", (payload.email, uid))
        if payload.phone:
            conn.execute("UPDATE users SET phone = ? WHERE uid = ?", (payload.phone, uid))
        conn.commit()
        log.db_log("USERS", f"Profile updated: {uid}", "INFO")
        return {"success": True, "message": "Profile updated"}
    except Exception as e:
        log.error(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.patch("/{uid}/character")
def update_character(uid: str, req: CharacterUpdate):
    conn = get_conn("game")
    try:
        conn.execute("UPDATE character_stats SET selected_char=? WHERE uid=?",
                     (req.selectedCharacter, uid))
        conn.commit()
    finally:
        conn.close()
    log.db_log("GAME", f"Character swap for {uid} -> #{req.selectedCharacter}", "INFO")
    return {"success": True}


@router.patch("/{uid}/settings")
def update_settings(uid: str, req: SettingsUpdate):
    log.db_log("USERS", f"Settings updated for {uid}", "INFO")
    return {"success": True}
