"""
Tooth Kingdom Adventure — Automated API Test Suite
Tests all backend endpoints. Run while the server is running.
Usage: python tools/test_backend.py
"""
import requests
import time
import sys

BASE_URL = "http://127.0.0.1:8010"

def test(name, url, method="GET", payload=None):
    try:
        if method == "GET":
            resp = requests.get(f"{BASE_URL}{url}", timeout=5)
        elif method == "POST":
            resp = requests.post(f"{BASE_URL}{url}", json=payload, timeout=5)
        elif method == "PATCH":
            resp = requests.patch(f"{BASE_URL}{url}", json=payload, timeout=5)
        elif method == "DELETE":
            resp = requests.delete(f"{BASE_URL}{url}", timeout=5)
        else:
            resp = requests.get(f"{BASE_URL}{url}", timeout=5)

        status = "PASS" if resp.status_code in (200, 201) else f"FAIL ({resp.status_code})"
        print(f"  [{name:.<40}] {status}")
        return resp.status_code in (200, 201)
    except Exception as e:
        print(f"  [{name:.<40}] FAIL (Error: {e})")
        return False

def run_all():
    print("\n" + "=" * 50)
    print("    TOOTH KINGDOM BACKEND — TEST SUITE v2.0")
    print("=" * 50)
    results = []

    # Health
    results.append(test("Health Check", "/"))
    results.append(test("Route List", "/debug/routes"))

    # Auth
    results.append(test("Auth: Register", "/auth/register", "POST",
                        {"name": "Tester", "email": "test@test.com", "password": "Pass123!"}))
    results.append(test("Auth: Login", "/auth/login", "POST",
                        {"email": "test@test.com", "password": "Pass123!"}))
    results.append(test("Auth: Google", "/auth/google", "POST",
                        {"name": "GUser", "email": "g@test.com", "provider_id": "g_123"}))
    results.append(test("Auth: Phone OTP", "/auth/phone", "POST", {"phone": "+12345"}))

    # Users
    results.append(test("User: Get Profile", "/users/local_test"))
    results.append(test("User: Save Profile", "/users/local_test", "POST",
                        {"name": "Updated", "userData": {"level": 2, "xp": 100}}))

    # Game
    results.append(test("Game: Brushing Log", "/game/local_test/brushing-log", "POST",
                        {"date": "2024-03-17", "duration": 120, "quality": 90, "xp": 10, "gold": 5}))
    results.append(test("Game: Chapter", "/game/local_test/chapter-complete", "POST",
                        {"chapterId": 1, "chapterName": "Enamel Hunt", "stars": 3, "score": 1000}))
    results.append(test("Game: XP Sync", "/game/local_test/xp", "POST",
                        {"xpRaw": 100, "level": 2, "gold": 50}))

    # Rewards
    results.append(test("Rewards: Catalog", "/rewards/catalog"))
    results.append(test("Rewards: User", "/rewards/local_test"))
    results.append(test("Rewards: Achievement", "/rewards/local_test/achievement", "POST",
                        {"achievement_id": "first_brush", "name": "First Brush", "xp_reward": 50}))

    # Quests
    results.append(test("Quests: Get Daily", "/quests/local_test"))

    # Social
    results.append(test("Social: Leaderboard", "/social/leaderboard"))

    # AI
    results.append(test("AI: Chat", "/ai/process", "POST", {"text": "Hello Tanu"}))
    results.append(test("AI: Legacy Alias", "/process", "POST", {"text": "How to brush?"}))
    results.append(test("AI: VR Analyze", "/ai/vr-analyze", "POST", {"uid": "local_test"}))

    # Backward-compat aliases
    results.append(test("Alias: Leaderboard", "/leaderboard"))

    passed = sum(1 for x in results if x)
    total = len(results)
    print("\n" + "-" * 50)
    print(f"  RESULT: {passed}/{total} Passed")
    print("-" * 50 + "\n")

if __name__ == "__main__":
    time.sleep(1)
    run_all()
