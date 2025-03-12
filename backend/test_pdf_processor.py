import unittest
from pdf_processor import PDFProcessor
import os
from datetime import datetime

class TestPDFProcessor(unittest.TestCase):
    def setUp(self):
        self.pdf_processor = PDFProcessor()
        
    def test_process_pdf(self):
        # Use the sample PDF in your directory
        pdf_path = "onlineStatement.pdf"
        
        # Ensure the PDF file exists
        self.assertTrue(os.path.exists(pdf_path), "Test PDF file does not exist")
        
        # Process the PDF
        transactions = self.pdf_processor.process_pdf(pdf_path)
        
        # Basic validation of results
        self.assertIsNotNone(transactions, "Transactions should not be None")
        self.assertIsInstance(transactions, list, "Transactions should be a list")
        
        if transactions:  # If any transactions were found
            # Test the first transaction
            first_transaction = transactions[0]
            
            # Check transaction structure
            self.assertIn('transaction_date', first_transaction)
            self.assertIn('description', first_transaction)
            self.assertIn('amount', first_transaction)
            self.assertIn('expense_category', first_transaction)
            
            # Validate date format
            try:
                datetime.strptime(first_transaction['transaction_date'], '%Y-%m-%d')
            except ValueError:
                self.fail("Date is not in YYYY-MM-DD format")
            
            # Validate amount
            self.assertIsInstance(first_transaction['amount'], (int, float))
            
            # Validate category
            valid_categories = ["Food", "Dining", "Transportation", "Utilities", 
                              "Shopping", "Entertainment", "Health", "Rent", "Other"]
            self.assertIn(first_transaction['expense_category'], valid_categories)
            
            # Print some sample results
            print("\nSample transactions processed:")
            for i, trans in enumerate(transactions[:5]):  # Print first 5 transactions
                print(f"\nTransaction {i + 1}:")
                print(f"Date: {trans['transaction_date']}")
                print(f"Description: {trans['description']}")
                print(f"Amount: ${trans['amount']:.2f}")
                print(f"Category: {trans['expense_category']}")

if __name__ == '__main__':
    unittest.main() 