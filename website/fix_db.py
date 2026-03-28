import mysql.connector
import json

MYSQL_CONFIG = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'tooth_kingdom',
}

def check_db():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        print("--- RUNNING DATABASE SURGERY ---")
        
        # 1. Find users with corrupted names
        # Use SQL 'LIKE' to find them directly without pulling massive strings into Python
        cursor.execute("SELECT id, uid, email FROM users WHERE name LIKE 'Executing tasks%' OR name LIKE '%AGPBI%' OR name LIKE '%assembleDebug%'")
        corrupted_users = cursor.fetchall()
        
        if not corrupted_users:
            print("No corrupted users found based on name keywords.")
        else:
            for user in corrupted_users:
                print(f"!!! DISCOVERED CORRUPTED USER: {user['uid']} !!!")
                new_name = user['email'].split('@')[0] if user['email'] else "Hero"
                print(f"Repairing name to: {new_name}")
                cursor.execute("UPDATE users SET name = %s WHERE id = %s", (new_name, user['id']))
        
        # 2. Check userData JSON blob for the same strings
        # We'll pull records and check them carefully
        cursor.execute("SELECT id, uid, email, userData FROM users")
        all_users = cursor.fetchall()
        for user in all_users:
            userData_raw = user['userData']
            if userData_raw and ('Executing tasks' in userData_raw or 'assembleDebug' in userData_raw):
                print(f"!!! DISCOVERED CORRUPTED userData for: {user['uid']} !!!")
                try:
                    userData = json.loads(userData_raw)
                    new_name = user['email'].split('@')[0] if user['email'] else "Hero"
                    userData['name'] = new_name
                    cursor.execute("UPDATE users SET userData = %s WHERE id = %s", (json.dumps(userData), user['id']))
                    print("Repairing userData JSON blob... SUCCESS")
                except:
                    print("Could not parse userData JSON, but it contains logs. Skipping complex fix.")

        conn.commit()
        cursor.close()
        conn.close()
        print("--- SURGERY COMPLETE ---")
    except Exception as e:
        print(f"Surgery Error: {e}")

if __name__ == "__main__":
    check_db()
