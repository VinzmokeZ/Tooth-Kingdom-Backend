"""
AI Router (Tanu Chatbot + VR Analysis)
Routes: POST /ai/process, GET /ai/history/{uid}, POST /ai/vr-analyze
"""
import os
import sys
import base64
import requests
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db.init_db import get_ai_conn
import logger as log

router = APIRouter(prefix="/ai", tags=["ai"])

GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = "EXAVITQu4voX998R6I7k"

TANU_SYSTEM_PROMPT = (
    "You are Tanu, the cheerful dental guide of the Tooth Kingdom. "
    "You speak kindly to children age 4-12. "
    "Answer in 1-2 short, friendly sentences. "
    "Only discuss teeth, dental hygiene, or Tooth Kingdom adventure topics. "
    "No emojis, just friendly text."
)

# Keyword-based fast responses (zero latency, zero API cost)
FAST_RESPONSES = [
    (["hello", "hi", "hey", "who are you", "what are you"],
     "Hello there! I'm Tanu, your Royal Guide to the Tooth Kingdom! What would you like to know about keeping your teeth healthy?"),
    (["brush", "how", "properly", "way", "technique"],
     "Brush in small circles for two whole minutes! Make sure to reach the back teeth too — that's where Sugar Bugs love to hide!"),
    (["pain", "hurt", "ache", "bleed", "blood", "sore"],
     "Oh no! If your teeth or gums hurt, you should tell your parents right away so they can take you to see a dentist!"),
    (["sugar", "candy", "sweets", "chocolate", "soda", "juice"],
     "Sweet treats feed the Sugar Bugs! Always brush nicely after eating sweets to keep your enamel strong and shiny!"),
    (["cavity", "why", "important", "decay", "rotten"],
     "Cavities happen when Sugar Bugs eat through your enamel. Brushing twice a day keeps them away forever!"),
    (["floss", "flossing"],
     "Flossing is like a secret weapon — it cleans between your teeth where your toothbrush can't reach!"),
    (["dentist", "doctor", "visit"],
     "A dentist is a tooth hero! Visiting them twice a year keeps your smile shining bright!"),
    (["kingdom", "adventure", "game", "play"],
     "The Tooth Kingdom is counting on you! Complete your brushing quests and become a legendary Enamel Knight!"),
    (["toothpaste", "paste", "brush with"],
     "Use a pea-sized amount of fluoride toothpaste — fluoride is like armor for your teeth!"),
    (["bye", "goodbye", "see you", "later"],
     "Goodbye! Remember to brush twice a day and keep those Sugar Bugs away. See you in the Tooth Kingdom!"),
]


class AIRequest(BaseModel):
    text: Optional[str] = None
    audio: Optional[str] = None
    uid: Optional[str] = None


class VRAnalyzeRequest(BaseModel):
    uid: Optional[str] = None
    brushing_zones: Optional[dict] = None
    duration_seconds: Optional[int] = 120


def _match_fast(text: str) -> Optional[str]:
    lower = text.lower()
    for keywords, reply in FAST_RESPONSES:
        if any(kw in lower for kw in keywords):
            return reply
    return None


def _call_gemini(user_input: str) -> Optional[str]:
    if not GOOGLE_GEMINI_API_KEY:
        return None
    try:
        url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
        payload = {
            "contents": [{"parts": [{"text": f"{TANU_SYSTEM_PROMPT}\n\nChild says: {user_input}"}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 80}
        }
        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"},
                             params={"key": GOOGLE_GEMINI_API_KEY}, timeout=12)
        if resp.status_code == 200:
            text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            return "".join(c for c in text if ord(c) < 65536)
        log.warn(f"Gemini {resp.status_code}: trying pro model...")
        url2 = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"
        resp2 = requests.post(url2, json=payload, headers={"Content-Type": "application/json"},
                              params={"key": GOOGLE_GEMINI_API_KEY}, timeout=12)
        if resp2.status_code == 200:
            return resp2.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        log.warn(f"Gemini error: {e}")
    return None


def _call_elevenlabs(text: str) -> Optional[str]:
    if not ELEVENLABS_API_KEY:
        return None
    try:
        resp = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
            json={"text": text[:250], "model_id": "eleven_monolingual_v1",
                  "voice_settings": {"stability": 0.5, "similarity_boost": 0.7}},
            headers={"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"},
            timeout=10
        )
        if resp.status_code == 200:
            return base64.b64encode(resp.content).decode("utf-8")
        log.warn(f"ElevenLabs {resp.status_code}")
    except Exception as e:
        log.warn(f"ElevenLabs error: {e}")
    return None


def _save_history(uid: str, user_msg: str, assistant_msg: str):
    try:
        conn = get_ai_conn()
        conn.execute("INSERT INTO chat_history (uid, role, message) VALUES (?,?,?)",
                     (uid, "user", user_msg))
        conn.execute("INSERT INTO chat_history (uid, role, message) VALUES (?,?,?)",
                     (uid, "assistant", assistant_msg))
        conn.commit()
        conn.close()
    except Exception as e:
        log.warn(f"AI history save failed: {e}")


@router.post("/process")
async def process_ai(req: AIRequest):
    user_input = req.text or ""
    uid = req.uid or "anonymous"

    if not user_input and not req.audio:
        return {"success": False, "text": "I didn't hear anything! Could you please speak up?"}

    log.info(f"AI request from {uid}: '{user_input[:60]}...'" if len(user_input) > 60
             else f"AI request from {uid}: '{user_input}'")

    # 1. Fast keyword match
    answer = _match_fast(user_input)
    if answer:
        log.info(f"AI [FAST]: matched keyword for '{user_input[:30]}'")
    else:
        # 2. Gemini API
        answer = _call_gemini(user_input)
        if answer:
            log.info("AI [Gemini]: got response")
        else:
            answer = "I'm having a little trouble thinking! Let's talk about brushing — did you brush twice today?"

    # 3. ElevenLabs TTS
    audio_b64 = _call_elevenlabs(answer)

    # 4. Save to history
    if uid != "anonymous":
        _save_history(uid, user_input, answer)

    return {"success": True, "text": answer, "audio": audio_b64, "query": user_input}


@router.get("/history/{uid}")
def get_history(uid: str, limit: int = 20):
    conn = get_ai_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM chat_history WHERE uid=? ORDER BY created_at DESC LIMIT ?",
            (uid, limit * 2)
        ).fetchall()
        messages = [{"role": r["role"], "message": r["message"],
                     "timestamp": r["created_at"]} for r in reversed(rows)]
        return {"success": True, "history": messages}
    finally:
        conn.close()


@router.post("/vr-analyze")
async def vr_analyze(req: VRAnalyzeRequest):
    """Analyze VR brushing session."""
    zones = req.brushing_zones or {}
    total_coverage = sum(1 for v in zones.values() if v) if zones else 0
    total_zones = len(zones) if zones else 8

    coverage_pct = int((total_coverage / total_zones) * 100) if total_zones else 0

    if coverage_pct >= 80:
        feedback = "Amazing brushing! You covered almost every area — the Tooth Kingdom is safe!"
        score = 95
    elif coverage_pct >= 60:
        feedback = "Good job! Try to reach the back corners a bit more next time!"
        score = 75
    else:
        feedback = "Keep trying! Remember to brush all areas — even the ones you can't easily see!"
        score = 50

    log.db_log("ai", f"VR analysis for {req.uid}: coverage={coverage_pct}%, score={score}")
    return {"success": True, "score": score, "coveragePct": coverage_pct, "feedback": feedback}
