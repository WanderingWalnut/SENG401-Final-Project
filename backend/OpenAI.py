from dotenv import load_dotenv
import os
from openai import OpenAI
import logging
from database import get_db  # Import from database module

# Load environment variables
load_dotenv()

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    def get_user_transactions(self, user_id):
        """
        Get transactions for a specific user from the database
        """
        try:
            # Get database connection from singleton
            db = get_db()
            cursor = db.cursor(dictionary=True)

            # Fetch transactions for the user
            query = """
            SELECT expense_category, amount, transaction_date, description
            FROM budget_data
            WHERE user_id = %s
            ORDER BY transaction_date DESC
            """
            cursor.execute(query, (user_id,))
            transactions = cursor.fetchall()

            # Close the cursor (connection remains open in pool)
            cursor.close()

            return transactions
        
        except Exception as e:
            logging.error(f"Error fetching transactions: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

    def analyze_spending(self, user_id):
        """
        Analyze spending patterns for a specific user
        """
        try:
            # Get transactions from the database
            transactions = self.get_user_transactions(user_id)

            if not transactions:
                return {
                    "error": "No transactions found. Please upload a bank statement first.",
                    "total_spent": 0,
                    "spending_by_category": {}
                }
            
            # Rest of the method remains the same...
            # [Keep all the existing analysis and OpenAI code here]
            
        except Exception as e:
            logging.error(f"Error in analyze_spending: {str(e)}")
            return {
                "error": f"Analysis error: {str(e)}",
                "total_spent": 0,
                "spending_by_category": {}
            }

    # Remove the create_connection method since we're using the singleton