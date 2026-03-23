"""
Tooth Kingdom Adventure — Database Initialization
Creates and manages 6 separate SQLite databases:
  auth.db, game.db, rewards.db, quests.db, social.db, ai.db
"""
import os
import sqlite3

DB_DIR = os.path.dirname(__file__)


def get_conn(db_name):
    """Get a connection to a specific database by name."""
    path = os.path.join(DB_DIR, f"{db_name}.db")
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


# ── Convenience shortcuts ─────────────────────────────────
def get_auth_conn():    return get_conn("auth")
def get_game_conn():    return get_conn("game")
def get_rewards_conn(): return get_conn("rewards")
def get_quests_conn():  return get_conn("quests")
def get_social_conn():  return get_conn("social")
def get_ai_conn():      return get_conn("ai")


def init_all_dbs():
    """Initialize all 6 databases with their schemas."""

    # ── 1. AUTH DB ────────────────────────────────────────
    conn = get_conn("auth")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT UNIQUE,
            name TEXT,
            email TEXT UNIQUE,
            password_hash TEXT,
            role TEXT DEFAULT 'child',
            phone TEXT,
            dob TEXT,
            provider TEXT DEFAULT 'local',
            provider_id TEXT,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            token TEXT,
            expires_at DATETIME
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS otp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT,
            code TEXT,
            expires_at DATETIME,
            used INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

    # ── 2. GAME DB ────────────────────────────────────────
    conn = get_conn("game")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS character_stats (
            uid TEXT PRIMARY KEY,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            gold INTEGER DEFAULT 0,
            enamel_health INTEGER DEFAULT 100,
            total_stars INTEGER DEFAULT 0,
            selected_char INTEGER DEFAULT 1,
            current_streak INTEGER DEFAULT 0,
            best_streak INTEGER DEFAULT 0,
            total_days INTEGER DEFAULT 0,
            completed_chapters INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS chapter_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            chapter_id INTEGER,
            chapter_name TEXT,
            stars_earned INTEGER DEFAULT 0,
            score INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            attempts INTEGER DEFAULT 1,
            UNIQUE(uid, chapter_id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS brushing_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            session_date TEXT,
            duration_seconds INTEGER,
            quality_score INTEGER,
            xp_earned INTEGER DEFAULT 0,
            gold_earned INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

    # ── 3. REWARDS DB ─────────────────────────────────────
    conn = get_conn("rewards")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            achievement_id TEXT,
            name TEXT,
            description TEXT,
            xp_reward INTEGER DEFAULT 0,
            unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(uid, achievement_id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS unlocked_rewards (
            uid TEXT,
            reward_id TEXT,
            reward_name TEXT,
            reward_type TEXT DEFAULT 'cosmetic',
            unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(uid, reward_id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            uid TEXT,
            item_id TEXT,
            item_name TEXT,
            item_type TEXT DEFAULT 'cosmetic',
            quantity INTEGER DEFAULT 1,
            acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(uid, item_id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reward_catalog (
            reward_id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            reward_type TEXT DEFAULT 'cosmetic',
            cost_gold INTEGER DEFAULT 0,
            unlock_level INTEGER DEFAULT 1,
            image_key TEXT
        )
    ''')
    conn.commit()
    conn.close()

    # ── 4. QUESTS DB ──────────────────────────────────────
    conn = get_conn("quests")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS quest_definitions (
            quest_id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            target_count INTEGER DEFAULT 1,
            xp_reward INTEGER DEFAULT 10,
            gold_reward INTEGER DEFAULT 5,
            icon TEXT DEFAULT 'Star',
            quest_type TEXT DEFAULT 'daily'
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS quest_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            quest_id TEXT,
            current_count INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            assigned_date TEXT,
            completed_at DATETIME,
            UNIQUE(uid, quest_id, assigned_date)
        )
    ''')
    # Seed default daily quests if empty
    count = conn.execute("SELECT COUNT(*) FROM quest_definitions").fetchone()[0]
    if count == 0:
        default_quests = [
            ("daily_brush_morning", "Morning Brush", "Brush your teeth in the morning", 1, 20, 10, "Sun", "daily"),
            ("daily_brush_night",   "Night Brush",   "Brush your teeth before bed",     1, 20, 10, "Moon", "daily"),
            ("daily_floss",         "Floss Hero",    "Floss your teeth once today",     1, 15, 5,  "Sparkles", "daily"),
            ("weekly_streak_3",     "3-Day Streak",  "Brush for 3 days in a row",       3, 50, 25, "Flame", "weekly"),
            ("weekly_streak_7",     "Week Warrior",  "Brush for 7 days in a row",       7, 100, 50, "Trophy", "weekly"),
        ]
        conn.executemany(
            "INSERT INTO quest_definitions (quest_id, title, description, target_count, xp_reward, gold_reward, icon, quest_type) VALUES (?,?,?,?,?,?,?,?)",
            default_quests
        )
    conn.commit()
    conn.close()

    # ── 5. SOCIAL DB ──────────────────────────────────────
    conn = get_conn("social")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS parent_children (
            parent_uid TEXT,
            child_uid TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(parent_uid, child_uid)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS teacher_students (
            teacher_uid TEXT,
            student_uid TEXT,
            class_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(teacher_uid, student_uid)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_uid TEXT,
            receiver_uid TEXT,
            message TEXT,
            type TEXT DEFAULT 'reminder',
            status TEXT DEFAULT 'unread',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

    # ── 6. AI DB ──────────────────────────────────────────
    conn = get_conn("ai")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            role TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_all_dbs()
    print("All 6 databases initialized successfully.")
