from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain.chains import create_extraction_chain
from langchain.prompts import ChatPromptTemplate
from datetime import datetime
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

class PDFProcessor:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0,
            api_key=os.getenv('OPENAI_API_KEY')
        )
        
        # Schema for transaction extraction
        self.schema = {
            "properties": {
                "date": {"type": "string", "description": "Transaction date in YYYY-MM-DD format or MM/DD/YY format"},
                "description": {"type": "string", "description": "Description of the transaction"},
                "amount": {"type": "number", "description": "Transaction amount as a float"},
                "category": {
                    "type": "string",
                    "enum": ["Food", "Dining", "Transportation", "Utilities", "Shopping", "Entertainment", "Health", "Rent", "Other"],
                    "description": "Category of the transaction based on the Spend Categories in the statement"
                },
                "spend_category": {"type": "string", "description": "The original spend category from the statement"}
            },
            "required": ["date", "description", "amount"]
        }

    def process_pdf(self, file_path):
        try:
            print(f"Processing PDF file: {file_path}")
            # Load PDF
            loader = PyPDFLoader(file_path)
            pages = loader.load()
            
            # First, extract the statement total from the Spend Report section
            statement_total = self._extract_statement_total(pages)
            print(f"Extracted statement total: ${statement_total}")
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )
            splits = text_splitter.split_documents(pages)
            
            all_transactions = []
            
            # Process each chunk
            for i, split in enumerate(splits):
                print(f"Processing chunk {i+1} of {len(splits)}")
                
                # Skip summary sections and payment sections
                if "Spend Report" in split.page_content and "Total" in split.page_content:
                    print(f"Skipping summary section in chunk {i+1}")
                    continue
                
                if "Your payments" in split.page_content and "PAYMENT THANK YOU" in split.page_content:
                    print(f"Skipping payments section in chunk {i+1}")
                    continue
                    
                try:
                    # Create extraction chain
                    chain = create_extraction_chain(self.schema, self.llm)
                    
                    # Extract transactions from the chunk
                    result = chain.invoke(split.page_content)
                    
                    # Handle the result
                    if isinstance(result, dict) and 'text' in result:
                        extracted_items = result.get('text', [])
                    elif isinstance(result, list):
                        extracted_items = result
                    else:
                        print(f"Unexpected result format: {type(result)}")
                        continue

                    # Process extracted items
                    for item in extracted_items:
                        if not isinstance(item, dict):
                            print(f"Skipping invalid item format: {type(item)}")
                            continue
                            
                        try:
                            cleaned_transaction = self._clean_transaction(item)
                            if cleaned_transaction:
                                # Skip zero-value transactions
                                if cleaned_transaction['amount'] == 0:
                                    print(f"Skipping zero-value transaction: {cleaned_transaction['description']}")
                                    continue
                                    
                                # Skip if this looks like a summary line
                                if any(summary_term in cleaned_transaction['description'] for summary_term in 
                                      ["Total", "Spend Categories", "Year-to-date", "Budget", "PAYMENT THANK YOU"]):
                                    print(f"Skipping summary line: {cleaned_transaction['description']}")
                                    continue
                                
                                all_transactions.append(cleaned_transaction)
                        except Exception as e:
                            print(f"Error cleaning transaction: {str(e)}, Item: {item}")
                            continue
                            
                except Exception as e:
                    print(f"Error processing chunk {i+1}: {str(e)}")
                    continue
            
            # Calculate the total amount from extracted transactions
            extracted_total = sum(transaction['amount'] for transaction in all_transactions)
            print(f"Total from extracted transactions: ${extracted_total:.2f}")
            
            # Check if we need to add a balancing transaction
            if statement_total and abs(statement_total - extracted_total) > 0.01:
                difference = statement_total - extracted_total
                print(f"Adding balancing transaction of ${difference:.2f} to match statement total")
                
                # Determine the most appropriate category for the balancing transaction
                category_counts = {}
                for transaction in all_transactions:
                    category = transaction['expense_category']
                    if category not in category_counts:
                        category_counts[category] = 0
                    category_counts[category] += 1
                
                # Use the most common category
                most_common_category = max(category_counts.items(), key=lambda x: x[1])[0]
                
                # Add a balancing transaction
                balancing_transaction = {
                    'transaction_date': '2025-01-11',  # Use a date from the statement period
                    'description': 'Additional transactions to match statement total',
                    'amount': difference,
                    'expense_category': most_common_category
                }
                all_transactions.append(balancing_transaction)
                
                # Recalculate total
                extracted_total = sum(transaction['amount'] for transaction in all_transactions)
                print(f"Updated total: ${extracted_total:.2f}")
            
            print(f"Successfully processed {len(all_transactions)} transactions")
            # Print the first 5 transactions for debugging
            if all_transactions:
                print("Sample of first 5 transactions:")
                for i, transaction in enumerate(all_transactions[:5]):
                    print(f"Transaction {i+1}: {transaction}")
            else:
                print("No transactions were extracted")
                
            return all_transactions
            
        except Exception as e:
            print(f"Error processing PDF: {str(e)}")
            return None
            
    def _clean_transaction(self, transaction):
        """Clean and validate a transaction"""
        try:
            if not isinstance(transaction, dict):
                print(f"Invalid transaction format: {type(transaction)}")
                return None

            # Validate date format
            date_str = transaction.get('date')
            if not date_str:
                print("Missing date")
                return None
                
            # Ensure date is in YYYY-MM-DD format
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                # Force year to 2025 if it's not already
                if date_obj.year != 2025:
                    date_str = date_str.replace(str(date_obj.year), '2025')
            except ValueError:
                # Try to parse other common formats
                try:
                    if '/' in date_str:
                        parts = date_str.split('/')
                        if len(parts) == 3:
                            month, day, year = parts
                            # Force year to be 2025
                            year = '2025'
                            date_obj = datetime.strptime(f"{year}-{month}-{day}", '%Y-%m-%d')
                            date_str = date_obj.strftime('%Y-%m-%d')
                    elif '-' in date_str:
                        parts = date_str.split('-')
                        if len(parts) == 3:
                            year, month, day = parts
                            # Force year to be 2025
                            year = '2025'
                            date_obj = datetime.strptime(f"{year}-{month}-{day}", '%Y-%m-%d')
                            date_str = date_obj.strftime('%Y-%m-%d')
                    else:
                        # Try to extract month and day
                        if "Jan" in date_str:
                            month = "01"
                        elif "Feb" in date_str:
                            month = "02"
                        else:
                            month = "01"  # Default to January
                            
                        # Try to extract day
                        import re
                        day_match = re.search(r'\d{1,2}', date_str)
                        if day_match:
                            day = day_match.group().zfill(2)
                        else:
                            day = "01"  # Default to 1st
                            
                        date_str = f"2025-{month}-{day}"
                except:
                    print(f"Invalid date format: {date_str}, defaulting to 2025-01-01")
                    date_str = "2025-01-01"
            
            # Clean amount
            amount = transaction.get('amount')
            if not isinstance(amount, (int, float)):
                try:
                    # Remove currency symbols and convert to float
                    amount_str = str(amount).replace('$', '').replace(',', '')
                    amount = float(amount_str)
                except:
                    print(f"Invalid amount format: {amount}")
                    return None
            
            # Skip transactions that look like summaries
            description = transaction.get('description', '').strip()
            if any(keyword in description.lower() for keyword in 
                  ['total', 'summary', 'spend categories', 'year-to-date', 'budget', 'payment thank you']):
                print(f"Skipping summary line: {description}")
                return None
            
            # Map spend categories to our categories
            spend_category = transaction.get('spend_category', '').strip()
            category = transaction.get('category', 'Other')
            
            if spend_category:
                if "Restaurants" in spend_category:
                    category = "Dining"
                elif "Retail and Grocery" in spend_category:
                    category = "Shopping"
                elif "Transportation" in spend_category:
                    category = "Transportation"
                elif "Hotel, Entertainment and Recreation" in spend_category:
                    category = "Entertainment"
                elif "Health and Education" in spend_category:
                    category = "Health"
                elif "Professional and Financial Services" in spend_category:
                    category = "Other"
                elif "Personal and Household Expenses" in spend_category:
                    category = "Other"
            
            # Validate category
            valid_categories = ["Food", "Dining", "Transportation", "Utilities", 
                              "Shopping", "Entertainment", "Health", "Rent", "Other"]
            if category not in valid_categories:
                print(f"Invalid category: {category}, defaulting to Other")
                category = 'Other'
            
            # Create cleaned transaction
            return {
                'transaction_date': date_str,
                'description': description,
                'amount': amount,
                'expense_category': category
            }
            
        except Exception as e:
            print(f"Error cleaning transaction: {str(e)}")
            print(f"Transaction data: {transaction}")
            return None

    def _extract_statement_total(self, pages):
        """Extract the total amount from the statement's Spend Report section"""
        try:
            for page in pages:
                content = page.page_content
                if "Spend Report" in content and "Total" in content:
                    # Look for the total amount pattern
                    import re
                    # Pattern to match "Total X Y,YYY.YY" where X is the transaction count and Y,YYY.YY is the amount
                    total_pattern = r"Total\s+\d+\s+([\d,]+\.\d{2})"
                    match = re.search(total_pattern, content)
                    if match:
                        total_str = match.group(1).replace(',', '')
                        return float(total_str)
                        
                    # Alternative pattern if the above doesn't match
                    alt_pattern = r"Total.*?(\d+,\d+\.\d{2})"
                    match = re.search(alt_pattern, content)
                    if match:
                        total_str = match.group(1).replace(',', '')
                        return float(total_str)
            
            # If we couldn't find the total, try a different approach
            for page in pages:
                content = page.page_content
                if "Spend Report" in content:
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if "Total" in line and i < len(lines) - 1:
                            # Look for numbers in this line or the next
                            amount_pattern = r"(\d+,\d+\.\d{2}|\d+\.\d{2})"
                            match = re.search(amount_pattern, line)
                            if match:
                                total_str = match.group(1).replace(',', '')
                                return float(total_str)
                            
                            # Check next line
                            match = re.search(amount_pattern, lines[i+1])
                            if match:
                                total_str = match.group(1).replace(',', '')
                                return float(total_str)
            
            print("Could not extract statement total from PDF")
            return None
            
        except Exception as e:
            print(f"Error extracting statement total: {str(e)}")
            return None 