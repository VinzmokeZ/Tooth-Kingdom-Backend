import requests

url = "http://127.0.0.1:8012/ai/process"
payload = {"text": "How do I brush my teeth?", "audio": None}

print("Sending request to 8012...")
try:
    resp = requests.post(url, json=payload, timeout=20)
    print("Status code:", resp.status_code)
    # print top 100 bytes of response
    print("Response snippet:", resp.text[:100])
except Exception as e:
    print("Failed to send request:", e)
