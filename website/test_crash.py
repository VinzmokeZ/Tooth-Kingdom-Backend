import requests
import json
import base64

url = "http://127.0.0.1:8010/ai/process"
payload = {
    "text": "How do I brush my teeth?",
    "audio": None
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Success: {data.get('success')}")
    print(f"Text: {data.get('text')}")
    if data.get('audio'):
        print(f"Audio received: {len(data.get('audio'))} chars of base64")
    else:
        print("No audio received.")
except Exception as e:
    print(f"Error calling backend: {e}")
