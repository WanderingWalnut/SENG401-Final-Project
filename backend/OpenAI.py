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
                password="Ch@rizard4lyfe",
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
                model="gpt-4o-mini",  
                messages=[
                    {
                        "role": "system",
                        "content": """You are a financial assistant that helps users analyze their spending habits and provide actionable advice on budgeting and cutbacks.

Your tone is professional, supportive, and non-judgmental. When analyzing transactions, identify trends, highlight areas where the user can reduce spending, and suggest realistic cutbacks based on their spending history.

Format your response with the following EXACT section headers:
- AREAS TO REDUCE:
- RECOMMENDATIONS:
- HIGH EXPENSE CATEGORIES:
- ACTION PLAN:

For the AREAS TO REDUCE section, use this format for each category:
- **Category Name**: 
  - Current Spending: $XXX.XX (XX.X%)
  - Suggested Reduction: XX% 
  - Potential Savings: $XX.XX

For the RECOMMENDATIONS section, number each recommendation and make them specific and actionable.

For the HIGH EXPENSE CATEGORIES section, identify categories that exceed typical benchmarks and include percentage comparisons.

For the ACTION PLAN section, number each step and include timeframes for implementation.

Use markdown formatting to highlight key information. Make your response clear, concise, and user-friendly."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1000,  # Increased token limit
                temperature=0.7
            )

            # Get the raw analysis text
            raw_analysis = response.choices[0].message.content
            
            # Format the analysis with HTML/CSS for better presentation
            formatted_analysis = self.format_analysis_with_html(raw_analysis, total_spent, categories)

            analysis_result = {
                "analysis": raw_analysis,
                "formatted_analysis": formatted_analysis,
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
            
    def format_analysis_with_html(self, raw_analysis, total_spent, categories):
        """
        Format the analysis with HTML/CSS for better presentation
        """
        try:
            # Split the analysis into sections based on headings
            sections = {}
            current_section = None
            
            # Process the raw analysis text
            lines = raw_analysis.split('\n')
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                if not line:
                    i += 1
                    continue
                
                # Check for section headers with different formats
                if "AREAS TO REDUCE" in line:
                    current_section = 'areas_to_reduce'
                    sections[current_section] = []
                    i += 1
                    # Collect content until next section header
                    while i < len(lines) and not any(header in lines[i].upper() for header in ["RECOMMENDATIONS", "HIGH EXPENSE", "ACTION PLAN"]):
                        content = lines[i].strip()
                        if content and not content.startswith('###'):
                            sections[current_section].append(content)
                        i += 1
                elif "RECOMMENDATIONS" in line:
                    current_section = 'recommendations'
                    sections[current_section] = []
                    i += 1
                    # Collect content until next section header
                    while i < len(lines) and not any(header in lines[i].upper() for header in ["HIGH EXPENSE", "ACTION PLAN"]):
                        content = lines[i].strip()
                        if content and not content.startswith('###'):
                            sections[current_section].append(content)
                        i += 1
                elif "HIGH EXPENSE" in line:
                    current_section = 'high_expense'
                    sections[current_section] = []
                    i += 1
                    # Collect content until next section header
                    while i < len(lines) and not "ACTION PLAN" in lines[i].upper():
                        content = lines[i].strip()
                        if content and not content.startswith('###'):
                            sections[current_section].append(content)
                        i += 1
                elif "ACTION PLAN" in line:
                    current_section = 'action_plan'
                    sections[current_section] = []
                    i += 1
                    # Collect remaining content
                    while i < len(lines):
                        content = lines[i].strip()
                        if content and not content.startswith('###'):
                            sections[current_section].append(content)
                        i += 1
                else:
                    i += 1
            
            # Helper function to convert markdown to HTML
            def markdown_to_html(text):
                # Convert bold markdown to HTML
                text = text.replace('**', '<strong>', 1)
                if '**' in text:
                    text = text.replace('**', '</strong>', 1)
                
                # Convert italic markdown to HTML
                text = text.replace('*', '<em>', 1)
                if '*' in text:
                    text = text.replace('*', '</em>', 1)
                
                return text
            
            # Create a visually appealing HTML structure
            html = f"""
            <div class="analysis-container">
                <div class="analysis-header">
                    <h2>Spending Analysis</h2>
                    <div class="total-spent">Total Spent: <span class="amount">${total_spent:.2f}</span></div>
                </div>
                
                <div class="analysis-sections">
            """
            
            # Add Areas to Reduce section
            if 'areas_to_reduce' in sections and sections['areas_to_reduce']:
                html += """
                    <div class="analysis-section reduce-section">
                        <h3>Areas to Reduce</h3>
                        <div class="section-content">
                """
                
                # Group items by category
                categories = {}
                current_category = None
                
                for item in sections['areas_to_reduce']:
                    # Check if this is a category header
                    import re
                    
                    # If it starts with a bullet and contains a category name
                    if item.startswith('-') and '**' in item:
                        # Extract the category name
                        match = re.search(r'\*\*(.*?)\*\*', item)
                        if match:
                            current_category = match.group(1)
                            if current_category not in categories:
                                categories[current_category] = []
                    elif current_category:
                        # Add the item to the current category
                        categories[current_category].append(item)
                
                # Now output each category
                for category, items in categories.items():
                    html += f"""
                        <div class="category-section">
                            <h4>{category}</h4>
                    """
                    
                    # Look for amount and savings
                    amount = None
                    savings = None
                    
                    for item in items:
                        if 'Current Spending:' in item:
                            match = re.search(r'\$([0-9,.]+)', item)
                            if match:
                                amount = match.group(0)
                        elif 'Potential Savings' in item:
                            match = re.search(r'\$([0-9,.]+)', item)
                            if match:
                                savings = match.group(0)
                    
                    # Output the summary
                    if amount or savings:
                        html += f"""
                            <div class="category-summary">
                        """
                        
                        if amount:
                            html += f"""
                                <div class="amount-item">
                                    <span class="label">Current Spending:</span>
                                    <span class="value">{amount}</span>
                                </div>
                            """
                        
                        if savings:
                            html += f"""
                                <div class="amount-item">
                                    <span class="label">Potential Savings:</span>
                                    <span class="value savings-value">{savings}</span>
                                </div>
                            """
                        
                        html += """
                            </div>
                        """
                    
                    # Output the details
                    html += """
                        <div class="category-details">
                    """
                    
                    for item in items:
                        # Clean up the item
                        item = item.strip()
                        if item.startswith('-'):
                            item = item[1:].strip()
                        
                        # Skip if it's just the category name
                        if f"**{category}**" in item:
                            continue
                            
                        html += f"""
                            <div class="detail-item">{markdown_to_html(item)}</div>
                        """
                    
                    html += """
                        </div>
                    </div>
                    """
                
                html += """
                        </div>
                    </div>
                """
            
            # Add Recommendations section
            if 'recommendations' in sections and sections['recommendations']:
                html += """
                    <div class="analysis-section recommendations-section">
                        <h3>Recommendations</h3>
                        <div class="section-content">
                            <ul>
                """
                for item in sections['recommendations']:
                    # Clean up bullet points and numbering
                    item = re.sub(r'^\d+\.\s*', '', item)
                    item = item.replace('- ', '')
                    
                    html += f"""
                                <li>{markdown_to_html(item)}</li>
                    """
                html += """
                            </ul>
                        </div>
                    </div>
                """
            
            # Add High Expense Categories section
            if 'high_expense' in sections and sections['high_expense']:
                html += """
                    <div class="analysis-section high-expense-section">
                        <h3>High Expense Categories</h3>
                        <div class="section-content">
                """
                
                # Group by category
                categories = {}
                current_category = None
                
                for item in sections['high_expense']:
                    # Clean up bullet points
                    item = item.replace('- ', '')
                    
                    # Check if this is a category header
                    if '**' in item and ':' in item:
                        # Extract the category name
                        match = re.search(r'\*\*(.*?)\*\*', item)
                        if match:
                            current_category = match.group(1)
                            if current_category not in categories:
                                categories[current_category] = []
                    elif current_category:
                        # Add the item to the current category
                        categories[current_category].append(item)
                
                # Now output each category
                for category, items in categories.items():
                    html += f"""
                        <div class="expense-category">
                            <div class="expense-category-name">{category}</div>
                    """
                    
                    for item in items:
                        html += f"""
                            <div class="expense-detail">{markdown_to_html(item)}</div>
                        """
                    
                    html += """
                        </div>
                    """
                
                html += """
                        </div>
                    </div>
                """
            
            # Add Action Plan section
            if 'action_plan' in sections and sections['action_plan']:
                html += """
                    <div class="analysis-section action-plan-section">
                        <h3>Action Plan</h3>
                        <div class="section-content">
                            <ol>
                """
                for item in sections['action_plan']:
                    # Clean up numbering and bullet points
                    item = re.sub(r'^\d+\.\s*', '', item)
                    item = item.replace('- ', '')
                    
                    # Skip the conclusion if it's there
                    if "implementing these recommendations" in item.lower():
                        continue
                        
                    html += f"""
                                <li>{markdown_to_html(item)}</li>
                    """
                html += """
                            </ol>
                        </div>
                    </div>
                """
            
            # Close the container
            html += """
                </div>
                
                <style>
                    .analysis-container {
                        font-family: 'Arial', sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        color: #333;
                    }
                    
                    .analysis-header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    
                    .analysis-header h2 {
                        color: #2c3e50;
                        margin-bottom: 10px;
                    }
                    
                    .total-spent {
                        font-size: 18px;
                        color: #34495e;
                    }
                    
                    .amount {
                        font-weight: bold;
                        color: #16a085;
                    }
                    
                    .analysis-sections {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    
                    .analysis-section {
                        background-color: white;
                        border-radius: 6px;
                        padding: 15px;
                        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
                    }
                    
                    .analysis-section h3 {
                        color: #2c3e50;
                        margin-top: 0;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    
                    .reduce-section {
                        border-left: 4px solid #e74c3c;
                    }
                    
                    .recommendations-section {
                        border-left: 4px solid #3498db;
                    }
                    
                    .high-expense-section {
                        border-left: 4px solid #f39c12;
                    }
                    
                    .action-plan-section {
                        border-left: 4px solid #27ae60;
                    }
                    
                    .category-section {
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px dashed #f0f0f0;
                    }
                    
                    .category-section:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                        padding-bottom: 0;
                    }
                    
                    .category-section h4 {
                        color: #e74c3c;
                        margin-top: 0;
                        margin-bottom: 10px;
                    }
                    
                    .category-summary {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin-bottom: 10px;
                        background-color: #f8f9fa;
                        padding: 10px;
                        border-radius: 4px;
                    }
                    
                    .amount-item {
                        display: flex;
                        align-items: center;
                        margin-right: 15px;
                    }
                    
                    .label {
                        font-weight: bold;
                        margin-right: 5px;
                    }
                    
                    .value {
                        color: #16a085;
                    }
                    
                    .savings-value {
                        color: #e74c3c;
                    }
                    
                    .category-details {
                        color: #7f8c8d;
                    }
                    
                    .detail-item {
                        margin-bottom: 5px;
                    }
                    
                    .expense-category {
                        margin-bottom: 15px;
                        padding-bottom: 15px;
                        border-bottom: 1px dashed #f0f0f0;
                    }
                    
                    .expense-category:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                        padding-bottom: 0;
                    }
                    
                    .expense-category-name {
                        font-weight: bold;
                        color: #f39c12;
                        margin-bottom: 5px;
                    }
                    
                    .expense-detail {
                        color: #7f8c8d;
                        margin-bottom: 5px;
                    }
                    
                    ul, ol {
                        padding-left: 20px;
                        margin: 0;
                    }
                    
                    li {
                        margin-bottom: 10px;
                    }
                    
                    li:last-child {
                        margin-bottom: 0;
                    }
                    
                    strong {
                        color: #2c3e50;
                    }
                    
                    @media (max-width: 768px) {
                        .analysis-sections {
                            grid-template-columns: 1fr;
                        }
                        
                        .category-summary {
                            flex-direction: column;
                        }
                    }
                </style>
            </div>
            """
            
            return html
        except Exception as e:
            print(f"Error formatting analysis: {str(e)}")
            return f"<div class='error'>Error formatting analysis: {str(e)}</div>"


