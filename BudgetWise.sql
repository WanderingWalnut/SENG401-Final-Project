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
    expense_category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password_hash) 
VALUES 
('John Doe', 'john@example.com', 'hashed_password_123'),
('Jane Smith', 'jane@example.com', 'hashed_password_456');

INSERT INTO budget_data (user_id, expense_category, amount, transaction_date, description) 
VALUES 
(1, 'Food', 50.00, '2025-03-09', 'Groceries'),
(1, 'Rent', 800.00, '2025-03-01', 'Monthly rent'),
(2, 'Entertainment', 30.00, '2025-03-08', 'Movie night'),
(2, 'Utilities', 120.00, '2025-03-05', 'Electricity bill');
