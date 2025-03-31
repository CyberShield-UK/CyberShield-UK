import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import jwt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from pythonjsonlogger import jsonlogger
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Security middleware
CORS(app)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per 15 minutes"]
)

# Add security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    return response

# Database connection
def get_db_connection():
    return psycopg2.connect(
        os.getenv('DATABASE_URL'),
        sslmode='require' if os.getenv('NODE_ENV') == 'production' else 'disable'
    )

# Logger setup
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Email configuration
def send_email(to_email, subject, body):
    msg = MIMEMultipart()
    msg['From'] = os.getenv('EMAIL_USER')
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(os.getenv('EMAIL_USER'), os.getenv('EMAIL_PASS'))
        server.send_message(msg)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Access token required'}), 401

        try:
            data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
            current_user = data
        except:
            return jsonify({'error': 'Invalid token'}), 403

        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401

        token = jwt.encode(
            {'id': user['id'], 'email': user['email'], 'role': user['role']},
            os.getenv('JWT_SECRET'),
            algorithm="HS256"
        )

        return jsonify({
            'token': token,
            'user': {'id': user['id'], 'email': user['email'], 'role': user['role']}
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/contact', methods=['POST'])
@limiter.limit("10 per hour")
def contact():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        html_content = f"""
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Message:</strong> {message}</p>
        """

        send_email(
            os.getenv('EMAIL_TO'),
            f'New Contact Form Submission from {name}',
            html_content
        )

        return jsonify({'message': 'Email sent successfully'})

    except Exception as e:
        logger.error(f"Contact form error: {str(e)}")
        return jsonify({'error': 'Failed to send email'}), 500

@app.route('/api/user-profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT id, email, role FROM users WHERE id = %s', (current_user['id'],))
        user = cur.fetchone()
        cur.close()
        conn.close()

        return jsonify(user)

    except Exception as e:
        logger.error(f"User profile error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/assessments', methods=['GET'])
@token_required
def get_assessments(current_user):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT a.*, c.company_name 
            FROM assessments a 
            JOIN clients c ON a.client_id = c.id 
            WHERE c.id IN (
                SELECT client_id FROM client_users WHERE user_id = %s
            )
        """, (current_user['id'],))
        assessments = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify(assessments)

    except Exception as e:
        logger.error(f"Assessments error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Serve static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join('public', path)):
        return send_from_directory('public', path)
    return send_from_directory('public', 'index.html')

# Error handling
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000))) 