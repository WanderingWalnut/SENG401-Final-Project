USE BudgetWise;
-- Delete all transactions but keep user accounts
DELETE FROM budget_data;
-- Reset auto-increment counter
ALTER TABLE budget_data AUTO_INCREMENT = 1;
-- Delete all users but keep user accounts
DELETE FROM users;
-- Reset auto-increment counter
ALTER TABLE users AUTO_INCREMENT = 1;
