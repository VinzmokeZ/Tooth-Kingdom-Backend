import mysql.connector

config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'tooth_kingdom',
    'raise_on_warnings': True
}

try:
    print("Attempting to connect to MySQL...")
    conn = mysql.connector.connect(**config)
    print("SUCCESS: Connected to MySQL!")
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    print("Tables:")
    for (table_name,) in cursor:
        print(f"- {table_name}")
    
    # Check if 'users' table has data
    cursor.execute("SELECT count(*) FROM users")
    count = cursor.fetchone()[0]
    print(f"Users in DB: {count}")
    
    conn.close()
except mysql.connector.Error as err:
    print(f"FAILURE: {err}")
except Exception as e:
    print(f"ERROR: {e}")
