from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from OpenAI import OpenAIService
from werkzeug.utils import secure_filename
import os
import pdfplumber
import re
from datetime import datetime
from collections import defaultdict
from pdf_processor import PDFProcessor
from dotenv import load_dotenv
import logging
import bcrypt

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "https://seng-401-final-project-ten.vercel.app"])

# Singleton Database Connection Class
class DatabaseConnection:
    _instance = None
    _connection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._initialize_connection()
        return cls._instance

    @classmethod
    def _initialize_connection(cls):
        try:
            cls._connection = mysql.connector.connect(
                host=os.getenv("MYSQLHOST"),
                user=os.getenv("MYSQLUSER"),
                password=os.getenv("MYSQLPASSWORD"),
                database=os.getenv("MYSQLDATABASE"),
                port=os.getenv("MYSQLPORT"),
                pool_size=5,
                pool_name="budgetwise_pool",
                pool_reset_session=True
            )
            print("Database connection pool created")
        except Error as e:
            print(f"Database connection failed: {e}")
            raise

    @classmethod
    def get_connection(cls):
        if not cls._connection.is_connected():
            cls._connection.reconnect(attempts=3, delay=5)
        return cls._connection

    @classmethod
    def close_connection(cls):
        if cls._connection.is_connected():
            cls._connection.close()
            print("Database connection closed")

# Initialize services
load_dotenv()
ai_service = OpenAIService()
pdf_processor = PDFProcessor()

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Modified connection handler using Singleton
def get_db():
    return DatabaseConnection().get_connection()

# Routes
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({"error": "All fields are required"}), 400

        db = get_db()
        cursor = db.cursor()

        try:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"error": "User already exists"}), 409

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (name, email, hashed_password.decode('utf-8'))
            db.commit()
            return jsonify({"message": "Signup successful"}), 201

        finally:
            cursor.close()

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not all([email, password]):
            return jsonify({"error": "Email and password are required"}), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        try:
            cursor.execute("SELECT id, name, password_hash FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if user and bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
                return jsonify({
                    "message": "Login successful",
                    "user_id": user["id"],
                    "name": user["name"]
                })
            return jsonify({"error": "Invalid email or password"}), 401

        finally:
            cursor.close()

    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/analyze-spending/<int:user_id>", methods=["GET"])
def analyze_spending(user_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        try:
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "User not found"}), 404

            analysis = ai_service.analyze_spending(user_id)
            return jsonify(analysis) if "error" not in analysis else jsonify(analysis), 400

        finally:
            cursor.close()

    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        return jsonify({"error": f"Analysis error: {str(e)}"}), 500
    
@app.route('/api/upload-and-analyze-pdf', methods=['POST'])
def upload_and_analyze_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        user_id = request.form.get('user_id')

        if not user_id or file.filename == '':
            return jsonify({'error': 'Invalid request parameters'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)

            transactions = pdf_processor.process_pdf(file_path)
            if not transactions:
                return jsonify({'error': 'Could not extract data from PDF'}), 400

            db = get_db()
            cursor = db.cursor()
            
            try:
                transactions_added = 0
                for transaction in transactions:
                    cursor.execute(
                        """INSERT INTO budget_data 
                        (user_id, expense_category, amount, transaction_date, description)
                        VALUES (%s, %s, %s, %s, %s)""",
                        (user_id, transaction['expense_category'], transaction['amount'],
                         transaction['transaction_date'], transaction['description'])
                    )
                    transactions_added += 1
                db.commit()
                return jsonify({
                    'message': 'PDF processed successfully',
                    'transactions_count': transactions_added
                }), 200

            except Error as e:
                db.rollback()
                logging.error(f"Database error: {str(e)}")
                return jsonify({'error': 'Failed to save transactions'}), 500

            finally:
                cursor.close()
                try:
                    os.remove(file_path)
                except OSError:
                    pass

        return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        logging.error(f"PDF processing error: {str(e)}")
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

@app.route("/api/check-transactions/<int:user_id>", methods=["GET"])
def check_transactions(user_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        try:
            cursor.execute("SELECT COUNT(*) as total FROM budget_data WHERE user_id = %s", (user_id,))
            total = cursor.fetchone()['total']

            queries = {
                'transactions_by_date': """
                    SELECT DATE(transaction_date) as date, COUNT(*) as transactions_count,
                    SUM(amount) as total_amount FROM budget_data 
                    WHERE user_id = %s GROUP BY DATE(transaction_date) ORDER BY date DESC
                """,
                'recent_transactions': """
                    SELECT transaction_date, description, amount, expense_category, id as transaction_id
                    FROM budget_data WHERE user_id = %s ORDER BY transaction_date DESC LIMIT 10
                """,
                'category_summary': """
                    SELECT expense_category, COUNT(*) as count, SUM(amount) as total_amount,
                    MIN(transaction_date) as earliest_date, MAX(transaction_date) as latest_date
                    FROM budget_data WHERE user_id = %s GROUP BY expense_category
                """,
                'monthly_spending': """
                    SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month, SUM(ABS(amount)) as total_amount
                    FROM budget_data WHERE user_id = %s GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
                    ORDER BY month ASC
                """
            }

            results = {}
            for key, query in queries.items():
                cursor.execute(query, (user_id,))
                results[key] = cursor.fetchall()

            return jsonify({
                'total_transactions': total,
                **results
            })

        finally:
            cursor.close()

    except Exception as e:
        logging.error(f"Transaction check error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500
    
@app.route("/api/transactions/<int:user_id>", methods=["GET"])
def get_transactions(user_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        try:
            cursor.execute("""
                SELECT id, transaction_date, description, amount, expense_category
                FROM budget_data WHERE user_id = %s ORDER BY transaction_date DESC
            """, (user_id,))
            return jsonify({"transactions": cursor.fetchall()})

        finally:
            cursor.close()

    except Error as e:
        logging.error(f"Transaction fetch error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

if __name__ == "__main__":
    try:
        app.run(debug=True, port=5001, host='0.0.0.0')
    finally:
        DatabaseConnection.close_connection()