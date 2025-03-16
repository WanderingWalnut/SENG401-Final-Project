USE BudgetWise;
-- Delete all transactions but keep user accounts
DELETE FROM budget_data;
-- Reset auto-increment counter
ALTER TABLE budget_data AUTO_INCREMENT = 1;