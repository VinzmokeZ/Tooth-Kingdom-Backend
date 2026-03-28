import os
import sys
import json
import random
import jwt
import sqlite3
import traceback
import requests
import base64
import faulthandler
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# Enable hard-crash logging for terminal disappearances
faulthandler.enable(file=open('hard_crash.log', 'w'))

# Standard FastAPI imports
try:
    from fastapi import FastAPI, HTTPException, Depends, Header
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
    from dotenv import load_dotenv
except ImportError as e:
    print(f"[FATAL] Missing basic libraries: {e}")
    sys.exit(1)

# --- UTILS ---
def safe_print(msg):
    """Prints safely even if there are emojis or unicode issues."""
    try:
        print(msg, flush=True)
    except:
        try:
            print(str(msg).encode('ascii', 'replace').decode('ascii'), flush=True)
        except:
            pass

def log_error(context, error):
    """Logs errors to a persistent file to survive console crashes."""
    try:
        with open("backend_crash.log", "a", encoding='utf-8') as f:
            f.write(f"\n[{datetime.now()}] {context}: {error}\n")
            f.write(traceback.format_exc())
            f.write("-" * 40 + "\n")
    except:
        pass

# --- BYPASS BCRYPT HACK (Cleaner) ---
try:
    import bcrypt
    from passlib.context import CryptContext
    # Passlib 1.7.4 compatibility for bcrypt 4.0+
    if not hasattr(bcrypt, '__about__'):
        class About: pass
        About.__version__ = getattr(bcrypt, '__version__', '4.0.0')
        bcrypt.__about__ = About()
    PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception as e:
    safe_print(f"[AUTH WARNING] Auth limited: {e}")
    PWD_CONTEXT = None

# --- LOAD CONFIG ---
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# --- DATABASE ---
SQLITE_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        cursor = conn.cursor()
        yield cursor, conn
    finally:
        conn.close()

def init_db():
    try:
        conn = sqlite3.connect(SQLITE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT UNIQUE,
                name TEXT,
                email TEXT UNIQUE,
                password_hash TEXT,
                role TEXT DEFAULT 'child',
                level INTEGER DEFAULT 1,
                xp INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 0,
                enamel_health INTEGER DEFAULT 100,
                total_stars INTEGER DEFAULT 0,
                selected_character INTEGER DEFAULT 1,
                completed_chapters INTEGER DEFAULT 0,
                current_streak INTEGER DEFAULT 0,
                total_days INTEGER DEFAULT 0,
                phone_number TEXT,
                date_of_birth TEXT,
                birth_place TEXT,
                parent_uid TEXT,
                userData TEXT
            )
        ''')
        conn.commit()
        conn.close()
        safe_print(f"[DB] Ready at {SQLITE_PATH}")
    except Exception as e:
        log_error("DB_INIT", e)
        safe_print(f"[DB ERROR] {e}")

init_db()

# --- APP ---
app = FastAPI(title="Tanu AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    dob: Optional[str] = None
    role: Optional[str] = "child"

class UserLogin(BaseModel):
    email: str
    password: str

class UserDataUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    userData: Dict[str, Any]

class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    provider: Optional[str] = "google"
    provider_id: Optional[str] = None

class PhoneAuthRequest(BaseModel):
    phone: str

class AIProcessRequest(BaseModel):
    text: Optional[str] = None
    audio: Optional[str] = None

# --- CONSTANTS ---
SECRET_KEY = "tooth-kingdom-secret-key"
ALGORITHM = "HS256"
INITIAL_USER_DATA = {
    "brushingLogs": {}, "completedChapters": 0, "currentStreak": 0, "bestStreak": 0,
    "totalStars": 0, "email": "", "lastBrushedTimestamp": None, "level": 1, "xp": 0,
    "gold": 0, "enamelHealth": 100, "questProgress": {"completedQuests": [], "activeQuests": []},
    "inventory": [], "name": "Hero", "selectedCharacter": 1,
    "settings": {"darkMode": False, "notifications": True, "sound": True},
    "totalDays": 0, "unlockedRewards": [], "achievements": [], "dob": None
}

# --- ROUTES ---
@app.get("/")
def home():
    return {"status": "online", "engine": "Haru-AI-v5"}

@app.post("/debug/log")
def debug_log(data: Dict[str, Any]):
    safe_print(f"[LOG] {data.get('message', 'empty')}")
    return {"ok": True}

@app.post("/auth/register")
def register(user: UserRegister, db_info=Depends(get_db)):
    cursor, db = db_info
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        raise HTTPException(400, "Email exists")
    
    uid = f"local_{random.randint(1000, 9999)}"
    hashed = PWD_CONTEXT.hash(user.password) if PWD_CONTEXT else user.password
    data = INITIAL_USER_DATA.copy()
    data.update({"name": user.name, "email": user.email})

    cursor.execute("INSERT INTO users (uid, name, email, password_hash, role, level, total_stars, userData) VALUES (?,?,?,?,?,?,?,?)",
                   (uid, user.name, user.email, hashed, user.role, 1, 0, json.dumps(data)))
    db.commit()
    return {"success": True, "user": {"id": uid, "name": user.name}}

@app.post("/auth/login")
def login(user: UserLogin, db_info=Depends(get_db)):
    cursor, db = db_info
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    row = cursor.fetchone()
    if not row or not PWD_CONTEXT.verify(user.password, row["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    
    token = jwt.encode({"uid": row["uid"], "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"success": True, "token": token, "user": {"id": row["uid"], "name": row["name"]}}

@app.post("/ai/process")
async def process_ai(request: AIProcessRequest):
    try:
        user_input = request.text
        audio_b64 = request.audio
        
        if not GOOGLE_GEMINI_API_KEY:
            safe_print("[AI] ERROR: Missing Gemini API Key!")
            return {"success": False, "text": "I need my magical key (API Key) to help you!"}

        safe_print(f"[AI] Request: Text={bool(user_input)}, Audio={bool(audio_b64)}")
        
        # 1. Audio Transcribe (Using REST if audio is present)
        # Note: direct audio-to-text via REST is bit complex, 
        # for now we focus on the text path which is where the crash happens.
        # If user provides audio, we'll try to find text or return fallback.
        
        if not user_input and not audio_b64:
            return {"success": False, "text": "I didn't hear anything! Could you please speak up?"}

        # 2. Brain (Mockup Plan Fast-Track OR Gemini REST)
        tanu_answer = None
        user_lower = user_input.lower() if user_input else ""
        
        # --- THE MOCKUP PLAN ---
        # Pre-determined answers for default dental questions (guarantees zero crashes)
        mock_responses = [
            (["hello", "hi ", "hey", "who"], "Hello there! I'm Guide Tanu, your Royal Guide to the Tooth Kingdom!"),
            (["how", "brush", "properly", "way", "do i"], "Brush your teeth in small circles for two whole minutes! Don't forget to reach the back!"),
            (["pain", "hurt", "bleed", "blood", "ache"], "Oh no! If your teeth hurt, you should tell your parents so they can schedule a dentist visit!"),
            (["sugar", "candy", "sweet", "chocolate"], "Candy is yummy, but Sugar Bugs love it too! Make sure to brush nicely after eating sweet treats!"),
            (["why", "important", "cavity", "decay"], "Brushing keeps the Sugar Bugs away and your teeth strong and shiny!"),
        ]
        
        for keywords, answer in mock_responses:
            if any(kw in user_lower for kw in keywords):
                tanu_answer = answer
                safe_print(f"[AI MOCKUP] Matched keyword! Fast-tracking response.")
                break
                
        # --- GEMINI FALLBACK (If no mockup keyword matches) ---        
        if not tanu_answer:
            try:
                # Try v1 first as it's more stable
                url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
                headers = {"Content-Type": "application/json"}
                params = {"key": GOOGLE_GEMINI_API_KEY}
                
                system_instruction = (
                    "You are Tanu, the cheerful dental guide. Answer briefly (2 sentences). "
                    "Only talk about teeth, hygiene, or the Tooth Kingdom. "
                    "No emojis, just friendly text."
                )
                
                payload = {
                    "contents": [{
                        "parts": [{"text": f"{system_instruction}\n\nUser Question: {user_input or 'Hello!'}"}]
                    }],
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 100}
                }
                
                resp = requests.post(url, json=payload, headers=headers, params=params, timeout=12)
                
                # Fallback to PRO if FLASH fails
                if resp.status_code != 200:
                    safe_print(f"[AI] Flash Model fail ({resp.status_code}), trying Pro...")
                    url_fallback = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"
                    resp = requests.post(url_fallback, json=payload, headers=headers, params=params, timeout=12)

                if resp.status_code == 200:
                    result = resp.json()
                    try:
                        tanu_answer = result['candidates'][0]['content']['parts'][0]['text'].strip()
                        # Final guard: Remove any remaining emojis that might crash older terminals
                        tanu_answer = "".join(c for c in tanu_answer if ord(c) < 65536)
                    except Exception as pe:
                        safe_print(f"[AI Parse Error] {pe}")
                        tanu_answer = "I'm not sure, but remember to brush twice a day!"
                else:
                    safe_print(f"[AI FINAL FAIL] Code: {resp.status_code}")
                    tanu_answer = "I'm having a little trouble thinking! Let's talk about brushing!"
                    
            except Exception as ge:
                safe_print(f"[AI Brain Global Error] {ge}")
                tanu_answer = "I'm having a little trouble thinking! Let's talk about brushing!"

        # 3. Voice (ElevenLabs REST)
        tanu_audio_b64 = None
        if ELEVENLABS_API_KEY and tanu_answer:
            try:
                v_id = "EXAVITQu4voX998R6I7k"
                v_url = f"https://api.elevenlabs.io/v1/text-to-speech/{v_id}"
                v_headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
                v_payload = {
                    "text": tanu_answer[:250], # Safety cap
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.7}
                }
                tts_resp = requests.post(v_url, json=v_payload, headers=v_headers, timeout=10)
                if tts_resp.status_code == 200:
                    tanu_audio_b64 = base64.b64encode(tts_resp.content).decode('utf-8')
                    safe_print(f"[AI] Harmony Voice Ready.")
                else:
                    safe_print(f"[AI Voice API] {tts_resp.status_code}")
            except Exception as te:
                safe_print(f"[AI Voice Error] {te}")


        return {
            "success": True,
            "text": tanu_answer,
            "audio": tanu_audio_b64,
            "query": user_input
        }

    except Exception as e:
        safe_print(f"[AI GLOBAL CRASH] {e}")
        log_error("AI_PROCESS_TOTAL", e)
        return {"success": False, "text": "My crown is buzzing! Let's try once more."}

if __name__ == "__main__":
    safe_print("=" * 30)
    safe_print("  HARU AI BACKEND v5.0")
    safe_print("=" * 30)
    try:
        uvicorn.run(app, host="127.0.0.1", port=8010, log_level="info")
    except Exception as e:
        log_error("UVICORN_START", e)
        safe_print(f"[FATAL] Server Error: {e}")
        input("Press ENTER to close...")
