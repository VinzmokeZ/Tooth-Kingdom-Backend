import mysql.connector

MYSQL_CONFIG = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'tooth_kingdom',
}

def debug():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT uid, name FROM users")
        records = cursor.fetchall()
        print(f"Total Users: {len(records)}")
        for r in records:
            name = str(r['name'])
            print(f"UID: {r['uid']} | Name Length: {len(name)}")
            if len(name) > 50:
                 print(f"  Starts with: {name[:50]}")
                 print(f"  Ends with: {name[-50:]}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug()
