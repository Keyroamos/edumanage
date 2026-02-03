import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print("DB not found")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

search_term = 'ChatGPT_Image_Jan_23_2026_02_20_37_PM.png'

for table_name in tables:
    tname = table_name[0]
    try:
        cursor.execute(f"SELECT * FROM {tname}")
        rows = cursor.fetchall()
        for row in rows:
            if search_term in str(row):
                print(f"Found in table {tname}: {row}")
    except Exception as e:
        pass

conn.close()
