from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from OpenAI import OpenAIService

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")  # Adjust to match your frontend port

# Initialize the OpenAI service
ai_service = OpenAIService()

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



if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')
