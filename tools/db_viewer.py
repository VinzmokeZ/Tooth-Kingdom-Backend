"""
Tooth Kingdom Adventure — Live Database Viewer v2.0
Beautiful real-time view of all 6 SQLite databases.
Run from the tools/ directory: python db_viewer.py
"""
import os, sys, time, sqlite3
from datetime import datetime

try:
    import colorama; colorama.init(autoreset=True)
except ImportError:
    pass

# ── Color palette ────────────────────────────────────────
R     = "\033[0m"
BOLD  = "\033[1m"
DIM   = "\033[2m"
RED   = "\033[91m"
GREEN = "\033[92m"
YEL   = "\033[93m"
BLUE  = "\033[94m"
MAG   = "\033[95m"
CYAN  = "\033[96m"
WHITE = "\033[97m"
GRAY  = "\033[90m"
ORAN  = "\033[38;5;208m"

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "db")

DBS = [
    {
        "file": "auth.db", "label": "AUTH", "color": CYAN, "icon": "[AUTH]",
        "tables": {
            "users": {
                "pk": "uid",
                "cols": ["uid", "name", "email", "role", "provider"],
                "display": lambda r: (
                    f"  {CYAN}{str(r.get('uid',''))[:22]:<22}{R}  "
                    f"{WHITE}{str(r.get('name',''))[:18]:<18}{R}  "
                    f"{GREEN}{str(r.get('role','')):<10}{R}  "
                    f"{GRAY}{str(r.get('email') or r.get('provider') or '')[:30]}{R}"
                )
            }
        }
    },
    {
        "file": "game.db", "label": "GAME", "color": GREEN, "icon": "[GAME]",
        "tables": {
            "character_stats": {
                "pk": "uid",
                "cols": ["uid", "level", "xp", "gold", "enamel_health", "current_streak"],
                "display": lambda r: (
                    f"  {GREEN}{str(r.get('uid',''))[:20]:<20}{R}  "
                    f"Lv{YEL}{str(r.get('level','?')):<3}{R}  "
                    f"XP:{CYAN}{str(r.get('xp','0')):<6}{R}  "
                    f"Gold:{YEL}{str(r.get('gold','0')):<6}{R}  "
                    f"HP:{GREEN}{str(r.get('enamel_health','100'))}%{R}  "
                    f"Streak:{str(r.get('current_streak','0')):<4}{R}"
                )
            }
        }
    },
    {
        "file": "quests.db", "label": "QUESTS", "color": MAG, "icon": "[QUEST]",
        "tables": {
            "quest_progress": {
                "pk": "uid+id", "cols": ["uid", "quest_id", "current_count", "completed"],
                "display": lambda r: (
                    f"  {MAG}{str(r.get('uid',''))[:18]:<20}{R}  "
                    f"{str(r.get('quest_id','')):<25}  "
                    f"{GREEN+'DONE'+R if r.get('completed') else YEL+'active'+R}"
                )
            }
        }
    },
    {
        "file": "rewards.db", "label": "REWARDS", "color": YEL, "icon": "[REWARD]",
        "tables": {
            "achievements": {
                "pk": "uid+id", "cols": ["uid", "achievement_id", "unlocked_at"],
                "display": lambda r: (
                    f"  {YEL}{str(r.get('uid',''))[:18]:<20}{R}  "
                    f"{GREEN}+{R}  {str(r.get('achievement_id','')):<30}  "
                    f"{GRAY}{str(r.get('unlocked_at',''))[:16]}{R}"
                )
            }
        }
    },
    {
        "file": "ai.db", "label": "AI / TANU", "color": ORAN, "icon": "[AI]   ",
        "tables": {
            "chat_history": {
                "pk": "id", "cols": ["uid", "role", "message", "created_at"],
                "display": lambda r: (
                    f"  {'U' if r.get('role')=='user' else 'T'}  "
                    f"{CYAN if r.get('role')=='user' else YEL}{str(r.get('uid',''))[:16]:<18}{R}  "
                    f"{GRAY}{str(r.get('message',''))[:50]:<50}{R}"
                )
            }
        }
    },
]


def get_viewer_conn(db_file):
    path = os.path.join(DB_DIR, db_file)
    if not os.path.exists(path): return None
    try:
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=1, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception: return None


def clear(): os.system("cls" if os.name == "nt" else "clear")


def render():
    clear()
    now = datetime.now().strftime("%H:%M:%S")
    print(f"\n{CYAN}{BOLD}  TOOTH KINGDOM - LIVE DATABASE VIEWER v2.0       {now}{R}")
    print(f"{GRAY}  Refreshes every 5s  |  Press CTRL+C to exit  |  Read-only mode{R}")

    for db in DBS:
        conn = get_viewer_conn(db["file"])
        print(f"\n{db['color']}{BOLD}  {db['icon']}  {db['label']} DATABASE{R}  {GRAY}({db['file']}){R}")
        if not conn:
            print(f"  {GRAY}  Database not found yet.{R}")
            continue
        for tname, tdef in db["tables"].items():
            try:
                count = conn.execute(f"SELECT COUNT(*) FROM {tname}").fetchone()[0]
            except: continue
            print(f"  {GRAY}Table: {WHITE}{BOLD}{tname}{R}  {GREEN}PK:{tdef['pk']}{R}  {GRAY}Rows: {WHITE}{count}{R}")
            try:
                col_str = ", ".join(tdef["cols"])
                rows = conn.execute(f"SELECT {col_str} FROM {tname} ORDER BY rowid DESC LIMIT 5").fetchall()
                for r in rows:
                    try: print(tdef["display"](dict(r)))
                    except: pass
                if not rows:
                    print(f"  {GRAY}  No records yet.{R}")
            except: pass
        conn.close()


if __name__ == "__main__":
    while True:
        try:
            render()
            time.sleep(5)
        except KeyboardInterrupt:
            print(f"\n  {YEL}DB Viewer closed.{R}\n")
            sys.exit(0)
        except: time.sleep(5)
