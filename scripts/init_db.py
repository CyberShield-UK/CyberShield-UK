import os
import psycopg2
import bcrypt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_database():
    try:
        # Connect to database
        conn = psycopg2.connect(
            os.getenv('DATABASE_URL'),
            sslmode='require' if os.getenv('NODE_ENV') == 'production' else 'disable'
        )
        cur = conn.cursor()

        # Read and execute schema.sql
        with open('schema.sql', 'r') as f:
            schema = f.read()
            cur.execute(schema)

        # Create admin user
        admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
        cur.execute("""
            INSERT INTO users (email, password_hash, role)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO NOTHING
        """, ('admin@cybershielduk.com', admin_password.decode('utf-8'), 'admin'))

        conn.commit()
        print("Database initialized successfully")

    except Exception as e:
        print(f"Error initializing database: {str(e)}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    init_database() 