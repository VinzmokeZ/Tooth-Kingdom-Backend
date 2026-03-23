"""
Tooth Kingdom Adventure — Database Cleanup Utility
Deletes all SQLite databases to start fresh.
"""
import os
import glob

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "db")

print("=== TOOTH KINGDOM DATABASE CLEANUP ===\n")

db_files = glob.glob(os.path.join(DB_DIR, "*.db"))
if not db_files:
    print("  No databases found. Already clean!")
else:
    for f in db_files:
        try:
            os.remove(f)
            print(f"  [DELETED] {os.path.basename(f)}")
        except Exception as e:
            print(f"  [ERROR] Could not delete {os.path.basename(f)}: {e}")

print("\n=== CLEANUP COMPLETE ===")
print("Run 'python main.py' to recreate fresh databases.")
