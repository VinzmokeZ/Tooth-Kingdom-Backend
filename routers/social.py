"""
Social Router
Routes: GET /social/leaderboard, GET /social/parent/{uid}/children,
        GET /social/teacher/{uid}/students, POST /social/parent/{uid}/link
"""
import os
import sys
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db.init_db import get_conn
import logger as log

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/leaderboard")
def get_leaderboard():
    g_conn = get_conn("game")
    a_conn = get_conn("auth")
    try:
        rows = g_conn.execute("""
            SELECT uid, total_stars FROM character_stats
            ORDER BY total_stars DESC LIMIT 10
        """).fetchall()

        leaderboard = []
        for idx, r in enumerate(rows):
            name_row = a_conn.execute("SELECT name FROM users WHERE uid=?", (r["uid"],)).fetchone()
            leaderboard.append({
                "rank": idx + 1,
                "uid": r["uid"],
                "name": name_row["name"] if name_row else "Hero",
                "stars": r["total_stars"]
            })
        return {"success": True, "leaderboard": leaderboard}
    finally:
        g_conn.close()
        a_conn.close()


@router.get("/parent/{parent_uid}/children")
def get_children(parent_uid: str):
    s_conn = get_conn("social")
    a_conn = get_conn("auth")
    g_conn = get_conn("game")
    try:
        child_rows = s_conn.execute(
            "SELECT child_uid FROM parent_children WHERE parent_uid=?", (parent_uid,)
        ).fetchall()

        children = []
        for r in child_rows:
            c_uid = r["child_uid"]
            auth_row = a_conn.execute("SELECT name, email FROM users WHERE uid=?", (c_uid,)).fetchone()
            game_row = g_conn.execute(
                "SELECT level, total_stars, enamel_health, selected_char FROM character_stats WHERE uid=?", (c_uid,)
            ).fetchone()
            children.append({
                "uid": c_uid,
                "name": auth_row["name"] if auth_row else "Child",
                "level": game_row["level"] if game_row else 1,
                "stars": game_row["total_stars"] if game_row else 0,
                "health": game_row["enamel_health"] if game_row else 100,
                "character": game_row["selected_char"] if game_row else 1
            })
        return {"success": True, "children": children}
    finally:
        s_conn.close()
        a_conn.close()
        g_conn.close()


@router.get("/teacher/{teacher_uid}/students")
def get_students(teacher_uid: str):
    s_conn = get_conn("social")
    a_conn = get_conn("auth")
    g_conn = get_conn("game")
    try:
        student_rows = s_conn.execute(
            "SELECT student_uid, class_id FROM teacher_students WHERE teacher_uid=?", (teacher_uid,)
        ).fetchall()

        students = []
        for r in student_rows:
            s_uid = r["student_uid"]
            auth_row = a_conn.execute("SELECT name FROM users WHERE uid=?", (s_uid,)).fetchone()
            game_row = g_conn.execute(
                "SELECT level, total_stars, enamel_health, selected_char FROM character_stats WHERE uid=?", (s_uid,)
            ).fetchone()
            students.append({
                "uid": s_uid,
                "name": auth_row["name"] if auth_row else "Student",
                "classId": r["class_id"],
                "level": game_row["level"] if game_row else 1,
                "stars": game_row["total_stars"] if game_row else 0,
                "health": game_row["enamel_health"] if game_row else 100,
            })
        return {"success": True, "students": students}
    finally:
        s_conn.close()
        a_conn.close()
        g_conn.close()


@router.post("/parent/{parent_uid}/link")
def link_child(parent_uid: str, child_uid: str):
    conn = get_conn("social")
    try:
        conn.execute("INSERT OR IGNORE INTO parent_children (parent_uid, child_uid) VALUES (?,?)",
                     (parent_uid, child_uid))
        conn.commit()
    finally:
        conn.close()
    log.db_log("SOCIAL", f"Link: Parent {parent_uid} -> Child {child_uid}", "INFO")
    return {"success": True}
