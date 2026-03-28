import mysql.connector
import os
import glob

config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'tooth_kingdom',
    'raise_on_warnings': True
}

print("=== STARTING DATABASE CLEANUP ===")

# 1. Clean MySQL
try:
    print("[1/3] Connecting to MySQL...")
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    
    print("      Truncating 'users' table...")
    try:
        cursor.execute("TRUNCATE TABLE users")
    except:
        cursor.execute("DELETE FROM users")
        
    conn.commit()
    conn.close()
    print("      [OK] MySQL 'users' table cleared.")
except Exception as e:
    print(f"      [WARNING] MySQL cleanup failed or skipped: {e}")

# 2. Clean SQLite
print("[2/3] Cleaning SQLite...")
sqlite_path = os.path.join(os.path.dirname(__file__), "database.db")
if os.path.exists(sqlite_path):
    try:
        os.remove(sqlite_path)
        print("      [OK] Deleted database.db")
    except Exception as e:
        print(f"      [ERROR] Could not delete database.db: {e}")
else:
    print("      [OK] No SQLite database found.")

# 3. Clean JSON Mirror
print("[3/3] Cleaning JSON Mirror...")
json_dir = os.path.join(os.path.dirname(__file__), "database", "users")
if os.path.exists(json_dir):
    files = glob.glob(os.path.join(json_dir, "*.json"))
    for f in files:
        try:
            os.remove(f)
        except:
            pass
    print(f"      [OK] Deleted {len(files)} JSON files.")
else:
    print("      [OK] JSON directory not found.")

print("=== CLEANUP COMPLETE ===")
print("You can now start with a fresh database.")
