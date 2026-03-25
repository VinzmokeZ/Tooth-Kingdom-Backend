"""
Tooth Kingdom Adventure — Backend Server v5.0
FastAPI + SQLite | Port 8010
Clean Architecture: Modular routers + 6 SQLite databases
"""
import os
import sys
import time
import json
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

import logger as log
from db.init_db import init_all_dbs, get_conn

# Import routers
from routers import auth, users, game, rewards, quests, social, ai

# ── Config ────────────────────────────────────────────────
load_dotenv()
BACKEND_VERSION = "5.0.0"

# ── App Setup ─────────────────────────────────────────────
app = FastAPI(
    title="Tooth Kingdom Adventure — Backend",
    version=BACKEND_VERSION,
    description="Clean Python backend for Tooth Kingdom Adventure"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Logging Middleware ────────────────────────────
@app.middleware("http")
async def log_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = int((time.time() - start) * 1000)
    log.api_log(request.method, request.url.path, response.status_code, duration)
    return response

# ── Mount All Routers ─────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(game.router)
app.include_router(rewards.router)
app.include_router(quests.router)
app.include_router(social.router)
app.include_router(ai.router)

# ── Models (for routes defined in main.py) ────────────────
class DebugLogRequest(BaseModel):
    message: str

class InteractionRequest(BaseModel):
    component: str
    action: str
    data: Optional[Dict[str, Any]] = None

class ReminderRequest(BaseModel):
    sender_uid: str
    receiver_uid: str
    message: Optional[str] = "Time to brush!"
    type: Optional[str] = "reminder"

class LinkRequest(BaseModel):
    parent_uid: str
    child_identifier: str
    relation_type: str

# ── Core Routes ───────────────────────────────────────────
@app.get("/")
def health():
    return {
        "status": "online",
        "version": BACKEND_VERSION,
        "engine": "Tooth Kingdom Clean Architecture",
        "timestamp": datetime.now().isoformat()
    }

# ── Debug Routes ──────────────────────────────────────────
@app.post("/debug/log")
def debug_log(req: DebugLogRequest):
    log.db_log("DEBUG", req.message, "INFO")
    return {"status": "logged"}

@app.post("/debug/interaction")
async def log_interaction(req: InteractionRequest):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\033[95m[INTERACTION] [{timestamp}] \033[1m{req.component.upper()}\033[0m \033[95m>> {req.action}\033[0m")
    if req.data:
        print(f"      Data: {json.dumps(req.data)}")
    return {"status": "logged"}

@app.get("/debug/routes")
def list_routes():
    routes = [{"path": r.path, "methods": list(r.methods)} for r in app.routes if hasattr(r, 'methods')]
    return {"total": len(routes), "routes": sorted(routes, key=lambda x: x["path"])}

# ── Notifications ─────────────────────────────────────────
@app.get("/notifications/{uid}")
def get_notifications(uid: str):
    conn = get_conn("social")
    try:
        notes = conn.execute(
            "SELECT * FROM notifications WHERE receiver_uid = ? ORDER BY created_at DESC LIMIT 20",
            (uid,)
        ).fetchall()
        log.db_log("NOTIFY", f"Fetch notifications for {uid}: {len(notes)} found", "INFO")
        return [dict(n) for n in notes]
    finally:
        conn.close()

# ── Reminders ─────────────────────────────────────────────
@app.post("/reminders/send")
def send_reminder(req: ReminderRequest):
    conn = get_conn("social")
    try:
        conn.execute(
            "INSERT INTO notifications (sender_uid, receiver_uid, message, type) VALUES (?, ?, ?, ?)",
            (req.sender_uid, req.receiver_uid, req.message, req.type)
        )
        conn.commit()
        log.db_log("REMINDER", f"SENT: {req.sender_uid} -> {req.receiver_uid} ({req.type})", "INFO")
        return {"success": True, "message": "Reminder sent"}
    finally:
        conn.close()

# ── Relations ─────────────────────────────────────────────
@app.post("/relations/link")
def link_relation(req: LinkRequest):
    auth_conn = get_conn("auth")
    social_conn = get_conn("social")
    try:
        child = auth_conn.execute(
            "SELECT uid FROM users WHERE email = ? OR phone = ?",
            (req.child_identifier, req.child_identifier)
        ).fetchone()
        if not child:
            raise HTTPException(status_code=404, detail="Child/Student not found")

        child_uid = child["uid"]
        social_conn.execute(
            "INSERT OR IGNORE INTO parent_children (parent_uid, child_uid) VALUES (?, ?)",
            (req.parent_uid, child_uid)
        )
        social_conn.commit()
        log.db_log("RELATIONS", f"Link: {req.parent_uid} -> {child_uid} ({req.relation_type})", "INFO")
        return {"success": True, "message": "Link successful!", "child_uid": child_uid}
    finally:
        auth_conn.close()
        social_conn.close()

@app.delete("/relations/{parent_uid}/{child_uid}")
def unlink_relation(parent_uid: str, child_uid: str):
    conn = get_conn("social")
    try:
        conn.execute("DELETE FROM parent_children WHERE parent_uid = ? AND child_uid = ?", (parent_uid, child_uid))
        conn.commit()
        log.db_log("RELATIONS", f"Unlinked: {parent_uid} -> {child_uid}", "INFO")
        return {"success": True, "message": "Unlinked successfully"}
    finally:
        conn.close()

# ── Backward-Compatible Aliases ───────────────────────────
# These aliases preserve old API paths for existing frontends

@app.get("/leaderboard")
def leaderboard_alias(filter: str = "stars"):
    return social.get_leaderboard()

@app.get("/teacher/{teacher_uid}/students")
def teacher_students_alias(teacher_uid: str):
    return social.get_students(teacher_uid)

@app.get("/parent/{parent_uid}/children")
def parent_children_alias(parent_uid: str):
    return social.get_children(parent_uid)

@app.post("/process")
async def process_ai_alias(req: ai.AIRequest):
    """Backward-compatible alias for /ai/process"""
    return await ai.process_ai(req)

# ── Startup ───────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_all_dbs()
    log.success("All 6 databases initialized successfully")

# ── Entry Point ───────────────────────────────────────────
if __name__ == "__main__":
    init_all_dbs()
    print("=" * 60)
    print("    TOOTH KINGDOM ADVENTURE BACKEND v" + BACKEND_VERSION)
    print("    Clean Architecture Edition")
    print("=" * 60)
    print("\n  REGISTERED ROUTES:")
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = list(route.methods)
            print(f"   {', '.join(methods):<8} {route.path}")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8117, log_level="warning", access_log=False)
