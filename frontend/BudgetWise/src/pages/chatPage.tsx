import React, { CSSProperties, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import "../App.css";
import backgroundImage from "../assets/GreenGradient.svg";

// TypeScript interfaces for our data structures
interface MonthlySpending {
  month: string;
  total_amount: number;
}

interface LineChartData {
  month: string;
  spending: number;
}

interface CategorySummary {
  expense_category: string;
  count: number;
  total_amount: number;
  earliest_date: string;
  latest_date: string;
}

interface PieChartData {
  name: string;
  value: number;
}

const COLORS = [
  "#00C49F",
  "#FF8042",
  "#0088FE",
  "#FFBB28",
  "#FF4444",
  "#AA66CC",
];

const ChatPage = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pieData, setPieData] = useState<PieChartData[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [lineData, setLineData] = useState<LineChartData[]>([]);

  // Function to format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString("default", { month: "short" });
  };

  // Function to fetch category summary data
  const fetchCategorySummary = async () => {
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const response = await fetch(
        `http://localhost:5001/api/check-transactions/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.category_summary) {
        // Transform the category summary into pie chart data
        const transformedData: PieChartData[] = data.category_summary.map(
          (item: CategorySummary) => ({
            name: item.expense_category,
            value: Math.abs(item.total_amount),
          })
        );

        // Calculate total expense
        const total = transformedData.reduce(
          (sum, item) => sum + item.value,
          0
        );

        setPieData(transformedData);
        setTotalExpense(total);
      }

      if (data.monthly_spending) {
        // Transform monthly spending data for the line chart
        const transformedLineData: LineChartData[] = data.monthly_spending.map(
          (item: MonthlySpending) => ({
            month: formatMonth(item.month),
            spending: item.total_amount,
          })
        );
        setLineData(transformedLineData);
      }
    } catch (error) {
      console.error("Error fetching category summary:", error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchCategorySummary();
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const response = await fetch(
        `http://localhost:5001/api/analyze-spending/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Error:", error);
      setAnalysis(
        "Sorry, I encountered an error while analyzing your spending."
      );
    }
    setIsLoading(false);
  };

  const styles: { [key: string]: CSSProperties } = {
    chatPageContainer: {
      display: "flex",
      flexWrap: "wrap",
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      color: "white",
      padding: "20px",
      boxSizing: "border-box",
      alignItems: "stretch",
      overflowY: "auto",
      gap: "20px",
    },
    mainContent: {
      display: "flex",
      flexWrap: "wrap",
      width: "100%",
      flexGrow: 1,
      gap: "20px",
    },
    leftSection: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      flex: "3",
      minWidth: "200px",
      maxWidth: "600px",
    },
    topLeftBox: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #444",
      borderRadius: "12px",
      padding: "20px",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    bottomLeftBox: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #444",
      borderRadius: "12px",
      padding: "20px",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    rightSection: {
      flex: "2",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      minHeight: "calc(100vh - 100px)",
      borderLeft: "2px solid #444",
      borderRadius: "12px",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      padding: "20px",
    },
    summaryContent: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      flex: "1",
    },
    summaryTitle: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    expenseSummary: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      fontSize: "0.9rem",
    },
    totalExpense: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#00C49F",
    },
    "@media (max-width: 1024px)": {
      mainContent: {
        flexDirection: "column",
        gap: "20px",
      },
      leftSection: {
        width: "100%",
        flex: "none",
      },
      rightSection: {
        width: "100%",
        flex: "none",
        borderLeft: "none",
        borderTop: "2px solid #444",
      },
    },
    "@media (max-width: 768px)": {
      chatPageContainer: {
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      },
      mainContent: {
        flexDirection: "column",
        gap: "20px",
      },
      rightSection: {
        order: "-1",
        minHeight: "400px",
        width: "100%",
      },
      leftSection: {
        width: "100%",
      },
      bottomLeftBox: {
        flexDirection: "column",
        alignItems: "center",
      },
    },
    analysisContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%",
      overflowY: "auto",
      borderRadius: "12px",
      height: "calc(100vh - 250px)",
      position: "relative",
    },
    analysisText: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      margin: "20px",
      padding: "20px",
      borderRadius: "12px",
      whiteSpace: "pre-wrap",
      overflowY: "auto",
    },
    placeholderText: {
      color: "rgba(255, 255, 255, 0.5)",
      textAlign: "center",
      marginTop: "40px",
      fontSize: "16px",
    },
    buttonContainer: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "10px 0",
    },
    analyzeButton: {
      padding: "16px 32px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#00C49F",
      color: "white",
      cursor: "pointer",
      fontSize: "18px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#00b48f",
      },
    },
  };

  return (
    <div style={styles.chatPageContainer}>
      <div style={styles.mainContent}>
        <div style={styles.rightSection}>
          <div style={styles.analysisContainer}>
            <div style={styles.analysisText}>
              {analysis ? (
                analysis
              ) : (
                <div style={styles.placeholderText}>
                  Click "Analyze My Spending" to get insights about your
                  spending patterns
                </div>
              )}
            </div>
          </div>
          <div style={styles.buttonContainer}>
            <button
              onClick={handleAnalyze}
              style={styles.analyzeButton}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze My Spending"}
            </button>
          </div>
        </div>
        <div style={styles.leftSection}>
          <div style={styles.topLeftBox}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="spending"
                  stroke="#00C49F"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.bottomLeftBox}>
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                cx={100}
                cy={100}
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
            <div style={styles.summaryContent}>
              <div style={styles.summaryTitle}>Expense Summary</div>
              <div style={styles.totalExpense}>
                Total: ${totalExpense.toFixed(2)}
              </div>
              <div style={styles.expenseSummary}>
                <div>
                  {pieData
                    .slice(0, Math.ceil(pieData.length / 2))
                    .map((item, index) => (
                      <p key={index}>
                        {item.name}: ${item.value.toFixed(2)}
                      </p>
                    ))}
                </div>
                <div>
                  {pieData
                    .slice(Math.ceil(pieData.length / 2))
                    .map((item, index) => (
                      <p key={index}>
                        {item.name}: ${item.value.toFixed(2)}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
