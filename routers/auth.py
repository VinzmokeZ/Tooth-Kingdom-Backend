"""
Authentication Router
Routes: /auth/register, /auth/login, /auth/google, /auth/phone,
        /auth/verify-otp, /auth/sync, /auth/send-otp, /auth/me, /auth/logout
"""
import os
import sys
import json
import random
import socket
import smtplib
import jwt
from email.message import EmailMessage
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db.init_db import get_auth_conn, get_game_conn, get_quests_conn, get_conn
import logger as log

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "tooth-kingdom-secret-2024-change-in-prod")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7

# ── Password Hashing (direct bcrypt) ─────────────────────
try:
    import bcrypt as _bcrypt
    _USE_BCRYPT = True
except ImportError:
    _USE_BCRYPT = False
    log.warn("bcrypt not installed — passwords stored as plain text (dev only)")


def hash_password(pw: str) -> str:
    if _USE_BCRYPT:
        return _bcrypt.hashpw(pw.encode("utf-8")[:72], _bcrypt.gensalt()).decode("utf-8")
    return pw


def verify_password(pw: str, hashed: str) -> bool:
    if _USE_BCRYPT:
        try:
            return _bcrypt.checkpw(pw.encode("utf-8")[:72], hashed.encode("utf-8"))
        except Exception:
            return pw == hashed
    return pw == hashed


def make_token(uid: str) -> str:
    payload = {"uid": uid, "exp": datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_uid_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["uid"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


def _ensure_game_profile(uid: str, name: str):
    """Create game + quest profiles for new users."""
    try:
        conn = get_game_conn()
        conn.execute("INSERT OR IGNORE INTO character_stats (uid) VALUES (?)", (uid,))
        conn.commit()
        conn.close()
    except Exception as e:
        log.warn(f"Game profile init failed for {uid}: {e}")

    try:
        conn2 = get_quests_conn()
        today = datetime.now().strftime("%Y-%m-%d")
        quests = conn2.execute("SELECT quest_id FROM quest_definitions WHERE quest_type='daily'").fetchall()
        for q in quests:
            conn2.execute(
                "INSERT OR IGNORE INTO quest_progress (uid, quest_id, assigned_date) VALUES (?,?,?)",
                (uid, q["quest_id"], today)
            )
        conn2.commit()
        conn2.close()
    except Exception as e:
        log.warn(f"Quest init failed for {uid}: {e}")


def consolidate_identity(target_uid, email=None, phone=None):
    """Merge existing accounts into target UID across all databases."""
    if not email and not phone:
        return

    old_uid = None
    match_source = ""
    conn = get_auth_conn()
    try:
        if email:
            existing = conn.execute("SELECT uid FROM users WHERE email = ? AND uid != ? LIMIT 1",
                                    (email, target_uid)).fetchone()
            if existing:
                old_uid = existing["uid"]
                match_source = f"Email ({email})"

        if not old_uid and phone:
            clean_phone = phone.replace("+", "")
            existing = conn.execute(
                "SELECT uid FROM users WHERE (phone = ? OR phone = ?) AND uid != ? LIMIT 1",
                (phone, clean_phone, target_uid)
            ).fetchone()
            if existing:
                old_uid = existing["uid"]
                match_source = f"Phone ({phone})"
    finally:
        conn.close()

    if not old_uid:
        return

    log.db_log("SYNC", f"IDENTITY MERGE: {old_uid} -> {target_uid} via {match_source}", "INFO")

    db_table_map = [
        ("auth",    [("users", "uid")]),
        ("game",    [("character_stats", "uid"), ("chapter_progress", "uid"), ("brushing_logs", "uid")]),
        ("rewards", [("achievements", "uid"), ("unlocked_rewards", "uid"), ("inventory", "uid")]),
        ("quests",  [("quest_progress", "uid")]),
        ("social",  [("parent_children", "parent_uid"), ("parent_children", "child_uid"),
                      ("teacher_students", "teacher_uid"), ("teacher_students", "student_uid"),
                      ("notifications", "sender_uid"), ("notifications", "receiver_uid")]),
        ("ai",      [("chat_history", "uid")])
    ]

    for db_name, tables in db_table_map:
        try:
            db_conn = get_conn(db_name)
            for table, col in tables:
                try:
                    db_conn.execute(f"UPDATE OR IGNORE {table} SET {col} = ? WHERE {col} = ?",
                                    (target_uid, old_uid))
                except Exception as e:
                    log.warn(f"Merge error {db_name}.{table}: {e}")
            db_conn.commit()
            db_conn.close()
        except Exception as e:
            log.warn(f"Merge DB error {db_name}: {e}")

    # Delete old user
    conn = get_auth_conn()
    conn.execute("DELETE FROM users WHERE uid = ?", (old_uid,))
    conn.commit()
    conn.close()


# ── Models ────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    dob: Optional[str] = None
    role: Optional[str] = "child"
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    provider: Optional[str] = "google"
    provider_id: Optional[str] = None

class PhoneRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    code: str

class SyncRequest(BaseModel):
    uid: str
    email: str
    name: Optional[str] = "Hero"
    avatar_url: Optional[str] = None
    provider: Optional[str] = "google"
    phone: Optional[str] = None
    role: Optional[str] = "child"

class OTPSendRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    otp: str


# ── Email OTP ─────────────────────────────────────────────
def send_email_otp(target_email: str, otp: str):
    smtp_user = os.getenv("SMTP_EMAIL", "toothkingdomadventures@gmail.com")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    if not smtp_pass:
        log.warn("SMTP_PASSWORD not set — cannot send email OTP")
        return False

    msg = EmailMessage()
    msg.set_content(f"Your Tooth Kingdom Adventure verification code is: {otp}\n\nDo not share this code with anyone.")
    msg["Subject"] = "Tooth Kingdom Verification Code"
    msg["From"] = f"Tooth Kingdom <{smtp_user}>"
    msg["To"] = target_email

    try:
        gmail_host = "smtp.gmail.com"
        addr_info = socket.getaddrinfo(gmail_host, 587, socket.AF_INET, socket.SOCK_STREAM)
        ipv4_target = addr_info[0][4][0]
        with smtplib.SMTP(ipv4_target, 587, timeout=30) as server:
            server.set_debuglevel(0)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        log.db_log("OTP_SERVICE", f"Email sent to {target_email}", "INFO")
        return True
    except Exception as e:
        log.warn(f"SMTP port 587 failed: {e}")

    try:
        with smtplib.SMTP_SSL(ipv4_target, 465, timeout=30) as server:
            server.set_debuglevel(0)
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        log.db_log("OTP_SERVICE", f"Email sent (SSL) to {target_email}", "INFO")
        return True
    except Exception as e:
        log.error(f"SMTP total failure: {e}")
        return False


# ── Routes ────────────────────────────────────────────────
@router.post("/register")
def register(req: RegisterRequest):
    conn = get_auth_conn()
    try:
        existing = conn.execute("SELECT uid FROM users WHERE email=?", (req.email,)).fetchone()
        if existing:
            raise HTTPException(400, "Email already registered")

        if req.phone:
            phone_exists = conn.execute("SELECT uid FROM users WHERE phone=?", (req.phone,)).fetchone()
            if phone_exists:
                raise HTTPException(400, "Phone already registered")

        uid = f"local_{random.randint(100000, 999999)}"
        pw_hash = hash_password(req.password)

        conn.execute(
            "INSERT INTO users (uid, name, email, password_hash, role, provider, dob, phone) VALUES (?,?,?,?,?,?,?,?)",
            (uid, req.name, req.email, pw_hash, req.role, "local", req.dob, req.phone)
        )
        conn.commit()
        _ensure_game_profile(uid, req.name)
        consolidate_identity(uid, req.email, req.phone)

        token = make_token(uid)
        log.success(f"New user registered: {req.email} [{req.role}] uid={uid}")
        return {"success": True, "token": token,
                "user": {"uid": uid, "id": uid, "name": req.name, "email": req.email, "role": req.role}}
    finally:
        conn.close()


@router.post("/login")
def login(req: LoginRequest):
    conn = get_auth_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE email=?", (req.email,)).fetchone()
        if not row:
            raise HTTPException(401, "No account found with that email")
        if not verify_password(req.password, row["password_hash"]):
            raise HTTPException(401, "Incorrect password")

        token = make_token(row["uid"])
        log.success(f"Login: {req.email} [{row['role']}]")
        return {
            "success": True, "token": token,
            "user": {"uid": row["uid"], "id": row["uid"], "name": row["name"], "email": row["email"],
                     "role": row["role"], "phone": row["phone"]}
        }
    finally:
        conn.close()


@router.post("/google")
def google_auth(req: GoogleAuthRequest):
    conn = get_auth_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE email=?", (req.email,)).fetchone()
        if row:
            token = make_token(row["uid"])
            log.success(f"Google login (existing): {req.email}")
            return {"success": True, "token": token,
                    "user": {"uid": row["uid"], "id": row["uid"], "name": row["name"], "email": row["email"], "role": row["role"]}}

        uid = f"google_{req.provider_id or random.randint(100000, 999999)}"
        conn.execute(
            "INSERT INTO users (uid, name, email, role, provider, provider_id) VALUES (?,?,?,?,?,?)",
            (uid, req.name, req.email, "child", "google", req.provider_id)
        )
        conn.commit()
        _ensure_game_profile(uid, req.name)

        token = make_token(uid)
        log.success(f"Google register: {req.email} uid={uid}")
        return {"success": True, "token": token,
                "user": {"uid": uid, "id": uid, "name": req.name, "email": req.email, "role": "child"}}
    finally:
        conn.close()


@router.post("/sync")
def sync_external_user(req: SyncRequest):
    """Sync externally authenticated user (e.g. Google) with local database."""
    if not req.uid or req.uid == "undefined":
        raise HTTPException(status_code=400, detail="Invalid UID")

    conn = get_auth_conn()
    try:
        consolidate_identity(req.uid, req.email)

        conn.execute("""
            INSERT INTO users (uid, name, email, avatar_url, provider, role)
            VALUES (?,?,?,?,?,?)
            ON CONFLICT(uid) DO UPDATE SET
                name = excluded.name,
                email = excluded.email,
                avatar_url = excluded.avatar_url,
                provider = excluded.provider
        """, (req.uid, req.name, req.email, req.avatar_url, req.provider, req.role))
        conn.commit()
    finally:
        conn.close()

    _ensure_game_profile(req.uid, req.name)
    consolidate_identity(req.uid, req.email, req.phone)

    log.db_log("SYNC", f"SYNC SUCCESS: {req.email} | UID: {req.uid}", "INFO")
    return {"success": True, "uid": req.uid}


@router.post("/send-otp")
def send_otp(req: OTPSendRequest):
    """Send OTP via email (or simulate SMS)."""
    phone = req.phone
    otp = req.otp
    email = req.email

    if phone and not email and phone != "LOCAL":
        conn = get_auth_conn()
        user = conn.execute("SELECT email FROM users WHERE phone = ?", (phone,)).fetchone()
        conn.close()
        if user:
            email = user["email"]
            log.db_log("OTP_SERVICE", f"Found email {email} for phone {phone}", "INFO")

    print("\n" + "=" * 60)
    print(f"   [OTP REQUEST]  ID: {phone or email}")
    print(f"   [OTP REQUEST]  CODE: {otp}")
    print(f"   [OTP REQUEST]  EMAIL TARGET: {email or 'NONE'}")
    print("=" * 60 + "\n")

    if email:
        success = send_email_otp(email, otp)
        if success:
            return {"success": True, "message": "Email sent"}
        else:
            return {"success": False, "message": "Email failed"}

    log.db_log("OTP_SERVICE", f"SMS Simulation for {phone}", "WARNING")
    return {"success": True, "message": "SMS Simulated"}


@router.post("/phone")
def phone_auth(req: PhoneRequest):
    """Send OTP for phone auth (dev mode — OTP shown in logs)."""
    conn = get_auth_conn()
    try:
        otp = str(random.randint(100000, 999999))
        expires = (datetime.utcnow() + timedelta(minutes=10)).isoformat()
        conn.execute("DELETE FROM otp_codes WHERE phone=?", (req.phone,))
        conn.execute("INSERT INTO otp_codes (phone, code, expires_at) VALUES (?,?,?)",
                     (req.phone, otp, expires))
        conn.commit()
        log.info(f"OTP for {req.phone}: {otp} (DEV MODE)")
        return {"success": True, "message": "OTP sent", "dev_otp": otp}
    finally:
        conn.close()


@router.post("/verify-otp")
def verify_otp(req: OTPVerifyRequest):
    conn = get_auth_conn()
    try:
        row = conn.execute(
            "SELECT * FROM otp_codes WHERE phone=? AND code=? AND used=0 ORDER BY id DESC LIMIT 1",
            (req.phone, req.code)
        ).fetchone()
        if not row:
            raise HTTPException(400, "Invalid OTP code")
        if datetime.fromisoformat(row["expires_at"]) < datetime.utcnow():
            raise HTTPException(400, "OTP has expired")

        conn.execute("UPDATE otp_codes SET used=1 WHERE id=?", (row["id"],))

        user_row = conn.execute("SELECT * FROM users WHERE phone=?", (req.phone,)).fetchone()
        if user_row:
            uid = user_row["uid"]
            name = user_row["name"]
            role = user_row["role"]
        else:
            uid = f"phone_{random.randint(100000, 999999)}"
            name = "Mobile Hero"
            role = "child"
            conn.execute(
                "INSERT INTO users (uid, name, phone, role, provider) VALUES (?,?,?,?,?)",
                (uid, name, req.phone, role, "phone")
            )
            _ensure_game_profile(uid, name)

        conn.commit()
        token = make_token(uid)
        log.success(f"OTP verified for {req.phone}, uid={uid}")
        return {"success": True, "token": token,
                "user": {"uid": uid, "id": uid, "name": name, "role": role, "phone": req.phone}}
    finally:
        conn.close()


@router.get("/me")
def get_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No token provided")
    token = authorization.split(" ", 1)[1]
    uid = get_uid_from_token(token)
    conn = get_auth_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE uid=?", (uid,)).fetchone()
        if not row:
            raise HTTPException(404, "User not found")
        return {"success": True, "user": {"uid": row["uid"], "id": row["uid"], "name": row["name"],
                "email": row["email"], "role": row["role"], "phone": row["phone"]}}
    finally:
        conn.close()


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    log.info("Logout requested")
    return {"success": True, "message": "Logged out"}
