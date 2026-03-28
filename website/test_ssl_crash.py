import requests
import json
import base64
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
GEMINI_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")

print("1. Testing internet connection...")
try:
    requests.get("https://www.google.com", timeout=5)
    print("Internet OK.")
except Exception as e:
    print(f"Internet Error: {e}")

print("2. Testing Gemini API (Simulating the chat interaction)...")
try:
    url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_KEY}
    payload = {
        "contents": [{"parts": [{"text": "Hello!"}]}],
        "generationConfig": {"maxOutputTokens": 10}
    }
    
    print("Calling Gemini...")
    resp = requests.post(url, json=payload, headers=headers, params=params, timeout=10)
    print(f"Gemini Status: {resp.status_code}")
except Exception as e:
    print(f"Gemini Exception: {e}")

print("3. Test Complete.")
