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
                "date": {"type": "string", "description": "Transaction date in YYYY-MM-DD format"},
                "description": {"type": "string", "description": "Description of the transaction"},
                "amount": {"type": "number", "description": "Transaction amount as a float"},
                "category": {
                    "type": "string",
                    "enum": ["Food", "Dining", "Transportation", "Utilities", "Shopping", "Entertainment", "Health", "Rent", "Other"],
                    "description": "Category of the transaction"
                }
            },
            "required": ["date", "description", "amount", "category"]
        }

    def process_pdf(self, file_path):
        try:
            print(f"Processing PDF file: {file_path}")
            # Load PDF
            loader = PyPDFLoader(file_path)
            pages = loader.load()
            
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
                                all_transactions.append(cleaned_transaction)
                        except Exception as e:
                            print(f"Error cleaning transaction: {str(e)}, Item: {item}")
                            continue
                            
                except Exception as e:
                    print(f"Error processing chunk {i+1}: {str(e)}")
                    continue
            
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
                datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                # Try to parse other common formats
                try:
                    if '/' in date_str:
                        parts = date_str.split('/')
                        if len(parts) == 3:
                            month, day, year = parts
                            if len(year) == 2:
                                year = '20' + year
                            date_obj = datetime.strptime(f"{year}-{month}-{day}", '%Y-%m-%d')
                            date_str = date_obj.strftime('%Y-%m-%d')
                except:
                    print(f"Invalid date format: {date_str}")
                    return None
            
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
            
            # Validate category
            category = transaction.get('category', 'Other')
            valid_categories = ["Food", "Dining", "Transportation", "Utilities", 
                              "Shopping", "Entertainment", "Health", "Rent", "Other"]
            if category not in valid_categories:
                print(f"Invalid category: {category}, defaulting to Other")
                category = 'Other'
            
            # Create cleaned transaction
            return {
                'transaction_date': date_str,
                'description': transaction.get('description', '').strip(),
                'amount': amount,
                'expense_category': category
            }
            
        except Exception as e:
            print(f"Error cleaning transaction: {str(e)}")
            print(f"Transaction data: {transaction}")
            return None 