from dotenv import load_dotenv
import os
from openai import OpenAI
import mysql.connector
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
            # Connect to the database
            connection = mysql.connector.connect(
                host="localhost",
                user="root",
                password="N@veed786",
                database="BudgetWise"
            )
            cursor = connection.cursor(dictionary=True)

            # Fetch transactions for the user
            query = """
            SELECT expense_category, amount, transaction_date, description
            FROM budget_data
            WHERE user_id = %s
            ORDER BY transaction_date DESC
            """
            cursor.execute(query, (user_id,))
            transactions = cursor.fetchall()

            # Close the connection
            cursor.close()
            connection.close()

            return transactions
        
        except Exception as e:
             print(f"Error fetching transactions: {str(e)}")
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
            
            # Format the transactions for the AI
            transaction_summary = ""
            total_spent = 0
            categories = {}

            # Organize transactions by category
            for transaction in transactions:
                amount = float(transaction['amount'])
                category = transaction['expense_category']
                total_spent += amount

                # Add the spending to the category
                if category in categories:
                    categories[category] += amount
                else:
                    categories[category] = amount
                
                transaction_summary += f"- ${amount:.2f} spent on {category} on {transaction['transaction_date']} ({transaction['description']})\n"

            # Create category summary
            category_summary = "\nSpending by category:\n"
            for category, amount in categories.items():
                percentage = (amount/total_spent) * 100
                category_summary += f"- {category}: ${amount:.2f} ({percentage:.1f}%)\n"

            prompt = f"""
            As a financial advisor, analyze these transactions:

            Total Spent: ${total_spent:.2f}
            {category_summary}

            Detailed transactions:
            {transaction_summary}

            Please provide a concise analysis with the following sections:

            - AREAS TO REDUCE:
              - List 2-3 specific categories where spending could be reduced
              - Include approximate amounts that could be saved

            - RECOMMENDATIONS:
              - Provide 3-4 practical money-saving tips based on spending patterns
              - Each recommendation should be actionable and specific

            - HIGH EXPENSE CATEGORIES:
              - Identify which categories exceed typical benchmarks
              - Include percentage comparisons where possible

            - ACTION PLAN:
              - List 3-4 concrete steps to optimize the budget
              - Include timeframes for implementation if possible

            Keep the response clear, concise, and organized with bullet points.
            """

            print(f"Analyzing spending for user {user_id} with {len(transactions)} transactions")
            
            # Call the OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",  # Fixed model name
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial assistant that helps users analyze their spending habits and provide actionable advice on budgeting and cutbacks. Your tone is professional, supportive, and non-judgmental. When analyzing transactions, identify trends, highlight areas where the user can reduce spending, and suggest realistic cutbacks based on their spending history. Provide insights such as: 'You spent $250 on dining out this month. Consider reducing it by 20% to save $50.' Offer practical budgeting strategies without being overly restrictive. Format your response with clear headings, bullet points, and proper spacing for readability. Use markdown formatting where appropriate to highlight key information. Always make your responses clear, concise, and user-friendly. Please ensure it's concise and to the point."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1000,  # Increased token limit
                temperature=0.7
            )

            analysis_result = {
                "analysis": response.choices[0].message.content,
                "total_spent": total_spent,
                "spending_by_category": categories
            }
            
            print(f"Analysis completed successfully for user {user_id}")
            return analysis_result
        
        except Exception as e:
            print(f"Error in analyze_spending: {str(e)}")
            return {
                "error": f"Analysis error: {str(e)}",
                "total_spent": 0,
                "spending_by_category": {}
            }


