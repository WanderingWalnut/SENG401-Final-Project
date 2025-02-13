from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")  # Adjust to match your frontend port

# Function to create a new MySQL connection
def create_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="N@veed786",
        database="testdb"
    )

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        db = create_connection()  # Establish a new connection for each request
        cursor = db.cursor()  # Create a cursor from the connection
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        cursor.close()  # Always close the cursor after using it
        db.close()  # Close the connection after finishing the request
        return jsonify({"users": users})
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')
