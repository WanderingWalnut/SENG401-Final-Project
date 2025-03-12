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

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")  # Adjust to match your frontend port

# Initialize the OpenAI service
ai_service = OpenAIService()

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
        password="N@veed786",
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

        # Fetch user data by email and password (plain text comparison)
        cursor.execute("SELECT * FROM users WHERE email = %s AND password_hash = %s", (email, password))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if user:
            return jsonify({"message": "Login successful", "user_id": user["id"]})
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/analyze-spending/<int:user_id>", methods=["GET"])
def analyze_spending(user_id):
    try:
        analysis = ai_service.analyze_spending(user_id)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": f"Analysis error: {str(e)}"}), 500

# Add this new route to handle PDF uploads
@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # Here you can add code to process the PDF and store data in your database
            # For now, we'll just return success
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'error': 'Server error during upload'}), 500

@app.route('/api/process-pdf/<filename>', methods=['POST'])
def process_pdf(filename):
    try:
        # Get user_id from request
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        # Construct the file path
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
            
        # Extract transactions from PDF
        transactions = extract_data_from_pdf(file_path)
        
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
        
        return jsonify({
            'message': 'PDF processed successfully',
            'transactions_count': transactions_added
        }), 200
        
    except Exception as e:
        print(f"Process PDF error: {str(e)}")
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

def extract_data_from_pdf(file_path):
    # Categories matching our database schema
    categories = {
        'Food': ['grocery', 'supermarket', 'food', 'market', 'walmart', 'target', 'kroger', 'safeway', 'trader joe'],
        'Dining': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza', 'taco', 'dining'],
        'Transportation': ['uber', 'lyft', 'taxi', 'transit', 'train', 'bus', 'gas', 'fuel', 'parking'],
        'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility', 'bill', 'cable', 'netflix', 'spotify'],
        'Shopping': ['amazon', 'ebay', 'store', 'retail', 'clothing', 'shop', 'mall', 'purchase'],
        'Entertainment': ['movie', 'theater', 'cinema', 'concert', 'event', 'ticket', 'subscription'],
        'Health': ['pharmacy', 'doctor', 'medical', 'healthcare', 'fitness', 'gym', 'walgreens', 'cvs'],
        'Rent': ['rent', 'lease', 'housing', 'apartment'],
        'Other': []  # Default category
    }
    
    # Format to match budget_data table structure
    transactions = []
    
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                # Look for transaction patterns (date, description, amount)
                # This pattern may need adjustment based on the specific PDF format
                transaction_matches = re.findall(r'(\d{1,2}/\d{1,2}(?:/\d{2,4})?)\s+([A-Za-z0-9\s\.\,\&\-\']+?)\s+(\$?\d+\.\d{2})', text)
                
                for date_str, description, amount_str in transaction_matches:
                    # Clean up the amount (remove $ and convert to float)
                    amount = float(amount_str.replace('$', '').strip())
                    
                    # Standardize date format (assuming MM/DD/YYYY or MM/DD/YY)
                    try:
                        if len(date_str.split('/')) == 3:
                            date_obj = datetime.strptime(date_str, '%m/%d/%Y' if len(date_str.split('/')[-1]) == 4 else '%m/%d/%y')
                        else:
                            # If year is missing, use current year
                            current_year = datetime.now().year
                            date_obj = datetime.strptime(f"{date_str}/{current_year}", '%m/%d/%Y')
                        
                        transaction_date = date_obj.strftime('%Y-%m-%d')
                    except ValueError:
                        # If date parsing fails, use current date
                        transaction_date = datetime.now().strftime('%Y-%m-%d')
                    
                    # Determine category based on description
                    expense_category = 'Other'
                    desc_lower = description.lower()
                    
                    for cat, keywords in categories.items():
                        if any(keyword in desc_lower for keyword in keywords):
                            expense_category = cat
                            break
                    
                    # Add to transactions in format matching budget_data table
                    transactions.append({
                        'expense_category': expense_category,
                        'amount': amount,
                        'transaction_date': transaction_date,
                        'description': description.strip()
                    })
        
        return transactions
    
    except Exception as e:
        print(f"Error extracting data from PDF: {str(e)}")
        return None
    

if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')
