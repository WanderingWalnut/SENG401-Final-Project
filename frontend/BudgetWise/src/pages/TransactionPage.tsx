import React, { CSSProperties, useState, useEffect } from "react";
import Navbar from "../components/ui/navbar";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

interface Transaction {
  id: number;
  transaction_date: string;
  description: string;
  amount: number;
  expense_category: string;
}

interface GroupedTransactions {
  [key: string]: Transaction[];
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<GroupedTransactions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/transactions/${userId}`
        );

        if (!response.ok) throw new Error("Failed to fetch transactions");

        const data = await response.json();
        const grouped = groupTransactionsByDate(data.transactions);
        setTransactions(grouped);

        const months = extractUniqueMonths(data.transactions);
        setAvailableMonths(months);

        const categories = Array.from(
          new Set(data.transactions.map((t: Transaction) => t.expense_category))
        );
        setAvailableCategories(categories);
      } catch (err) {
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    return transactions.reduce((acc: GroupedTransactions, transaction) => {
      const date = new Date(transaction.transaction_date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(transaction);
      return acc;
    }, {});
  };

  const extractUniqueMonths = (transactions: Transaction[]) => {
    const months = transactions.map((t) =>
      new Date(t.transaction_date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    );
    return Array.from(new Set(months));
  };

  const filteredTransactions = Object.entries(transactions)
    .filter(([date]) => {
      const monthYear = new Date(date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      return selectedMonth === "all" || monthYear === selectedMonth;
    })
    .map(([date, transactions]) => ({
      date,
      transactions: transactions.filter(
        (t) =>
          selectedCategory === "all" || t.expense_category === selectedCategory
      ),
    }))
    .filter((group) => group.transactions.length > 0);

  const styles: { [key: string]: CSSProperties } = {
    pageWrapper: {
      backgroundColor: "#0F172A",
      minHeight: "100vh",
      padding: "20px",
      color: "#E2E8F0",
    },
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexDirection: isMobile ? "column" : "row",
      gap: "15px",
    },
    monthSelect: {
      padding: "10px 15px",
      borderRadius: "8px",
      backgroundColor: "#1E293B",
      border: "1px solid #334155",
      color: "#E2E8F0",
      fontSize: "16px",
    },
    dateGroup: {
      backgroundColor: "#1E293B",
      borderRadius: "12px",
      marginBottom: "20px",
      border: "1px solid #334155",
    },
    dateHeader: {
      padding: "15px 20px",
      borderBottom: "1px solid #334155",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      fontSize: "1.1rem",
      fontWeight: 600,
    },
    transactionItem: {
      padding: "15px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #334155",
      ":last-child": {
        borderBottom: "none",
      },
    },
    category: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    categoryDot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
    },
    amount: {
      fontWeight: 600,
    },
    description: {
      color: "#94A3B8",
      fontSize: "0.9rem",
      marginTop: "5px",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      color: "#94A3B8",
    },
    error: {
      color: "#FF4444",
      textAlign: "center",
      padding: "40px",
    },
    filtersContainer: {
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
      marginBottom: "25px",
    },
    filterSelect: {
      padding: "10px 15px",
      borderRadius: "8px",
      backgroundColor: "#1E293B",
      border: "1px solid #334155",
      color: "#E2E8F0",
      fontSize: "16px",
      minWidth: "200px",
    },
    categoryOption: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "5px 10px",
    },
  };

  if (loading) return <div style={styles.loading}>Loading transactions...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Transaction History</h1>
          <div style={styles.filtersContainer}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Months</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {availableCategories.map((category) => (
                <option
                  key={category}
                  value={category}
                  style={styles.categoryOption}
                >
                  <div
                    style={{
                      ...styles.categoryDot,
                      backgroundColor:
                        CATEGORIES[category as keyof typeof CATEGORIES],
                    }}
                  />
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTransactions.map(({ date, transactions }) => (
          <div key={date} style={styles.dateGroup}>
            <div style={styles.dateHeader}>
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            {transactions.map((transaction) => (
              <div key={transaction.id} style={styles.transactionItem}>
                <div>
                  <div style={styles.category}>
                    <div
                      style={{
                        ...styles.categoryDot,
                        backgroundColor:
                          CATEGORIES[
                            transaction.expense_category as keyof typeof CATEGORIES
                          ],
                      }}
                    />
                    {transaction.expense_category}
                  </div>
                  <div style={styles.description}>
                    {transaction.description}
                  </div>
                </div>
                <div
                  style={{
                    ...styles.amount,
                    color: transaction.amount < 0 ? "#FF4444" : "#00C49F",
                  }}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div style={styles.error}>
            No transactions found for the selected filters
          </div>
        )}
      </div>
    </div>
  );
};

const CATEGORIES = {
  Food: "#00C49F",
  Dining: "#FF8042",
  Transportation: "#0088FE",
  Utilities: "#FFBB28",
  Shopping: "#FF4444",
  Entertainment: "#AA66CC",
  Health: "#7C3AED",
  Rent: "#00b48f",
  Other: "#94A3B8",
};

export default TransactionsPage;
