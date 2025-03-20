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

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")  # Adjust to match your frontend port

# Initialize services
load_dotenv()
ai_service = OpenAIService()
pdf_processor = PDFProcessor()

# Add this configuration after your existing configurations
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Add this helper function
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to create a new MySQL connection
def create_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="BudgetWise"
    )

# User Signup Route
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json  # Get JSON data from request
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        db = create_connection()
        cursor = db.cursor()

        # Check if the user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            db.close()
            return jsonify({"error": "User already exists"}), 409

        # Insert new user into the database
        cursor.execute("INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)", (name, email, password))
        db.commit()
        
        cursor.close()
        db.close()
        
        return jsonify({"message": "Signup successful"}), 201

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
# User Login Route
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json  # Get JSON data from request
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        db = create_connection()
        cursor = db.cursor(dictionary=True)

        # Fetch user data by email
        cursor.execute("SELECT id, name FROM users WHERE email = %s AND password_hash = %s", (email, password))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if user:
            return jsonify({
                "message": "Login successful",
                "user_id": user["id"],
                "name": user["name"]
            })
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/analyze-spending/<int:user_id>", methods=["GET"])
def analyze_spending(user_id):
    try:
        # Check if user exists
        db = create_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()
        db.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get the analysis
        analysis = ai_service.analyze_spending(user_id)
        
        # Check if there was an error
        if "error" in analysis:
            return jsonify(analysis), 400 if "No transactions found" in analysis["error"] else 500
            
        return jsonify(analysis)
        
    except Exception as e:
        print(f"Error in analyze_spending endpoint: {str(e)}")
        return jsonify({"error": f"Analysis error: {str(e)}"}), 500
    
@app.route('/api/upload-and-analyze-pdf', methods=['POST'])
def upload_and_analyze_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        user_id = request.form.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # Process PDF using LangChain
            transactions = pdf_processor.process_pdf(file_path)
            
            if not transactions:
                return jsonify({'error': 'Could not extract data from PDF'}), 400
                
            # Save transactions to database
            db = create_connection()
            cursor = db.cursor()
            
            transactions_added = 0
            
            for transaction in transactions:
                try:
                    cursor.execute(
                        "INSERT INTO budget_data (user_id, expense_category, amount, transaction_date, description) VALUES (%s, %s, %s, %s, %s)",
                        (
                            user_id,
                            transaction['expense_category'],
                            transaction['amount'],
                            transaction['transaction_date'],
                            transaction['description']
                        )
                    )
                    transactions_added += 1
                except Error as e:
                    print(f"Error inserting transaction: {str(e)}")
                    
            db.commit()
            cursor.close()
            db.close()
            
            # Clean up the uploaded file
            try:
                os.remove(file_path)
            except:
                pass
            
            return jsonify({
                'message': 'PDF processed successfully',
                'transactions_count': transactions_added
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        print(f"Process error: {str(e)}")
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

@app.route("/api/check-transactions/<int:user_id>", methods=["GET"])
def check_transactions(user_id):
    try:
        db = create_connection()
        cursor = db.cursor(dictionary=True)
        
        # Get total count
        cursor.execute("SELECT COUNT(*) as total FROM budget_data WHERE user_id = %s", (user_id,))
        total = cursor.fetchone()['total']
        
        # Get transactions grouped by date to see when they were added
        cursor.execute("""
            SELECT 
                DATE(transaction_date) as date,
                COUNT(*) as transactions_count,
                SUM(amount) as total_amount
            FROM budget_data 
            WHERE user_id = %s 
            GROUP BY DATE(transaction_date)
            ORDER BY date DESC
        """, (user_id,))
        transactions_by_date = cursor.fetchall()
        
        # Get recent transactions with full details
        cursor.execute("""
            SELECT 
                transaction_date,
                description,
                amount,
                expense_category,
                id as transaction_id
            FROM budget_data 
            WHERE user_id = %s 
            ORDER BY transaction_date DESC 
            LIMIT 10
        """, (user_id,))
        recent_transactions = cursor.fetchall()
        
        # Get summary by category
        cursor.execute("""
            SELECT 
                expense_category,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                MIN(transaction_date) as earliest_date,
                MAX(transaction_date) as latest_date
            FROM budget_data 
            WHERE user_id = %s 
            GROUP BY expense_category
        """, (user_id,))
        category_summary = cursor.fetchall()
        
        # Get monthly spending totals
        cursor.execute("""
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                SUM(ABS(amount)) as total_amount
            FROM budget_data 
            WHERE user_id = %s
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month ASC
        """, (user_id,))
        monthly_spending = cursor.fetchall()
        
        cursor.close()
        db.close()
        
        return jsonify({
            'total_transactions': total,
            'transactions_by_date': transactions_by_date,
            'recent_transactions': recent_transactions,
            'category_summary': category_summary,
            'monthly_spending': monthly_spending
        })

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route("/api/transactions/<int:user_id>", methods=["GET"])
def get_transactions(user_id):
    try:
        db = create_connection()
        cursor = db.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                id,
                transaction_date,
                description,
                amount,
                expense_category
            FROM budget_data 
            WHERE user_id = %s 
            ORDER BY transaction_date DESC
        """, (user_id,))
        transactions = cursor.fetchall()
        
        cursor.close()
        db.close()
        
        return jsonify({"transactions": transactions})

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')
