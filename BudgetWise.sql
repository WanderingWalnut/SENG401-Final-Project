DROP DATABASE IF EXISTS BudgetWise;
CREATE DATABASE IF NOT EXISTS BudgetWise;
USE BudgetWise;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
CREATE TABLE budget_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    expense_category ENUM(
        'Food',
        'Dining',
        'Transportation',
        'Utilities',
        'Shopping',
        'Entertainment',
        'Health',
        'Rent',
        'Other'
    ) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO users (name, email, password_hash)
VALUES (
        'John Doe',
        'john@example.com',
        'hashed_password_123'
    ),
    (
        'Jane Smith',
        'jane@example.com',
        'hashed_password_456'
    );
INSERT INTO budget_data (
        user_id,
        expense_category,
        amount,
        transaction_date,
        description
    )
VALUES (
        1,
        'Food',
        75.50,
        '2025-03-09',
        'Grocery shopping at Superstore'
    ),
    (
        1,
        'Dining',
        45.00,
        '2025-03-08',
        'Restaurant dinner'
    ),
    (
        1,
        'Transportation',
        120.00,
        '2025-03-07',
        'Monthly transit pass'
    ),
    (
        1,
        'Utilities',
        180.00,
        '2025-03-05',
        'Electricity and water bill'
    ),
    (
        1,
        'Shopping',
        250.00,
        '2025-03-04',
        'New winter jacket'
    ),
    (
        1,
        'Entertainment',
        60.00,
        '2025-03-03',
        'Movie tickets and snacks'
    ),
    (
        1,
        'Health',
        85.00,
        '2025-03-02',
        'Pharmacy prescription'
    ),
    (
        1,
        'Rent',
        1200.00,
        '2025-03-01',
        'Monthly apartment rent'
    ),
    (
        2,
        'Food',
        65.75,
        '2025-03-09',
        'Weekly groceries'
    ),
    (
        2,
        'Dining',
        35.00,
        '2025-03-08',
        'Lunch with colleagues'
    ),
    (
        2,
        'Other',
        150.00,
        '2025-03-07',
        'Miscellaneous expenses'
    );