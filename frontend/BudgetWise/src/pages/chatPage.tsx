import React, { CSSProperties, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import "../App.css";
import { useMediaQuery } from "react-responsive";
import Navbar from "../components/ui/navbar";
import { useNavigate } from "react-router-dom";

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
  const [formattedAnalysis, setFormattedAnalysis] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [pieData, setPieData] = useState<PieChartData[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [lineData, setLineData] = useState<LineChartData[]>([]);
  const [maxSpending, setMaxSpending] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isTablet = useMediaQuery({ maxWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const navigate = useNavigate();

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString("default", { month: "short" });
  };

  const fetchCategorySummary = async () => {
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/check-transactions/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.category_summary) {
        const transformedData: PieChartData[] = data.category_summary.map(
          (item: CategorySummary) => ({
            name: item.expense_category,
            value: Math.abs(item.total_amount),
          })
        );
        const total = transformedData.reduce(
          (sum, item) => sum + item.value,
          0
        );
        setPieData(transformedData);
        setTotalExpense(total);
      }

      if (data.monthly_spending) {
        const transformedLineData: LineChartData[] = data.monthly_spending.map(
          (item: MonthlySpending) => ({
            month: formatMonth(item.month),
            spending: item.total_amount,
          })
        );
        const maxValue = Math.max(
          ...transformedLineData.map((item) => item.spending)
        );
        setMaxSpending(maxValue);
        setLineData(transformedLineData);
      }
    } catch (error) {
      console.error("Error fetching category summary:", error);
    }
  };

  useEffect(() => {
    fetchCategorySummary();
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/analyze-spending/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.analysis) setAnalysis(data.analysis);
      if (data.formatted_analysis)
        setFormattedAnalysis(data.formatted_analysis);
    } catch (error) {
      console.error("Error:", error);
      setAnalysis(
        "Sorry, I encountered an error while analyzing your spending."
      );
      setFormattedAnalysis(null);
    }
    setIsLoading(false);
  };

  const styles: { [key: string]: CSSProperties } = {
    pageWrapper: {
      width: "100%",
      height: "100vh",
      boxSizing: "border-box",
      backgroundColor: "#0F172A",
    },
    chatPageContainer: {
      display: "flex",
      flexWrap: "wrap",
      height: "calc(100vh - 120px)",
      width: "100%",
      color: "#E2E8F0",
      padding: "20px",
      boxSizing: "border-box",
      alignItems: "stretch",
      overflow: "hidden",
      gap: "20px",
      ...(isMobile && { flexDirection: "column" }),
    },
    mainContent: {
      display: "flex",
      flexWrap: "wrap",
      width: "100%",
      height: "100%",
      gap: "20px",
      overflowY: "auto",
      ...(isTablet && { flexDirection: "column", maxWidth: "100%" }),
    },
    leftSection: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      flex: "3",
      minWidth: "40%",
      maxWidth: "600px",
      height: "100%",
      ...(isTablet && {
        width: "100%",
        flex: "none",
        height: "50%",
        maxWidth: "100%",
      }),
      ...(isMobile && { width: "100%", height: "50%", maxWidth: "100%" }),
    },
    topLeftBox: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #334155",
      borderRadius: "16px",
      padding: "20px",
      backgroundColor: "#1E293B",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
    },
    bottomLeftBox: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #334155",
      borderRadius: "16px",
      padding: "20px",
      backgroundColor: "#1E293B",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
      ...(isMobile && { maxWidth: "100%", justifyContent: "center" }),
    },
    rightSection: {
      flex: "2",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      height: "100%",
      borderLeft: "1px solid #334155",
      borderRadius: "16px",
      backgroundColor: "#1E293B",
      padding: "20px",
      boxSizing: "border-box",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
      ...(isTablet && {
        width: "100%",
        borderLeft: "none",
        borderTop: "1px solid #334155",
        maxWidth: "100%",
      }),
    },
    summaryContent: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      flex: "1",
      overflow: "auto",
      padding: "12px",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: "8px",
    },
    summaryTitle: {
      fontSize: "1.4rem",
      fontWeight: 700,
      marginBottom: "15px",
      color: "#7C3AED",
      paddingBottom: "8px",
      borderBottom: "2px solid #334155",
    },
    pieChartContainer: {
      width: "180px",
      height: "180px",
      display: "flex",
      alignItems: "center",
      transition: "transform 0.3s ease-in-out",
    },
    expenseSummary: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "12px",
      width: "100%",
      overflow: "auto",
      ...(isMobile && {
        gridTemplateColumns: "1fr",
      }),
    },
    categoryItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 15px",
      borderRadius: "6px",
      backgroundColor: isHovered
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.03)",
    },
    categoryName: {
      fontSize: "0.95rem",
      fontWeight: 500,
      color: "#E2E8F0",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    categoryAmount: {
      fontSize: "0.95rem",
      fontWeight: 600,
      color: "#00C49F",
    },
    totalExpense: {
      fontSize: "1.6rem",
      fontWeight: "bold",
      color: "#00C49F",
      marginBottom: "20px",
      padding: "12px",
      backgroundColor: "rgba(0, 196, 159, 0.1)",
      borderRadius: "8px",
      textAlign: "center",
      ...(isMobile && {
        fontSize: "1.3rem",
      }),
    },
    analysisContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%",
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
    },
    analysisText: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      margin: "0",
      padding: "20px",
      borderRadius: "12px",
      overflowY: "auto",
      color: "white",
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
      marginTop: "auto",
      marginBottom: "10px",
    },
    analyzeButton: {
      padding: "16px 32px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#00C49F",
      color: "white",
      cursor: "pointer",
      fontSize: "16px",
      transition: "all 0.2s ease",
      fontWeight: 600,
      boxShadow: "0 2px 4px rgba(0, 196, 159, 0.2)",
    },
    tooltip: {
      backgroundColor: "#1E293B",
      color: "white",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
    },
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "#00b48f";
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "#00C49F";
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      <div style={styles.chatPageContainer}>
        <div style={styles.mainContent}>
          <div style={styles.rightSection}>
            <div style={styles.analysisContainer}>
              <div style={styles.analysisText}>
                {formattedAnalysis ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: formattedAnalysis }}
                  />
                ) : analysis ? (
                  <pre style={{ whiteSpace: "pre-wrap" }}>{analysis}</pre>
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
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                {isLoading ? "Analyzing..." : "Analyze My Spending"}
              </button>
              <button
                onClick={() => navigate("/upload")}
                style={{
                  padding: "16px 32px",
                  marginLeft: "20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#7C3AED",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                  fontWeight: 600,
                  boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#6D28D9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#7C3AED")
                }
              >
                Upload PDF
              </button>
            </div>
          </div>
          <div style={styles.leftSection}>
            <div style={styles.topLeftBox}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    tick={{ fill: "#94A3B8" }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tick={{ fill: "#94A3B8" }}
                    domain={[0, Math.ceil(maxSpending * 1.2)]}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Spending"]}
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#E2E8F0",
                    }}
                    labelStyle={{ color: "#00C49F" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spending"
                    stroke="#00C49F"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#00C49F",
                      strokeWidth: 2,
                      stroke: "#1E293B",
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#fff",
                      stroke: "#00C49F",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.bottomLeftBox}>
              {!isMobile && (
                <div
                  style={{
                    ...styles.pieChartContainer,
                    transform: isHovered ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.3s ease-in-out",
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => {
                    setIsHovered(false);
                    setActiveIndex(null);
                  }}
                >
                  <PieChart width={180} height={180}>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={styles.tooltip}>
                              <strong>{payload[0].name}</strong>: $
                              {Number(payload?.[0]?.value ?? 0).toFixed(2)}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={pieData}
                      cx={90}
                      cy={90}
                      innerRadius={40}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      label={false}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={1}
                          opacity={
                            activeIndex === index || activeIndex === null
                              ? 1
                              : 0.6
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              )}
              <div style={{ ...styles.summaryContent, width: "60%" }}>
                <div style={styles.summaryTitle}>Expense Breakdown</div>
                <div style={styles.totalExpense}>
                  Total: ${totalExpense.toFixed(2)}
                </div>
                <div
                  style={{
                    ...styles.expenseSummary,
                    maxHeight: "calc(100% - 80px)",
                  }}
                >
                  {pieData.map((item, index) => (
                    <div
                      key={index}
                      style={styles.categoryItem}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <span
                        style={{
                          ...styles.categoryName,
                          color: COLORS[index % COLORS.length],
                        }}
                      >
                        {item.name}
                      </span>
                      <span style={styles.categoryAmount}>
                        ${item.value.toFixed(2)}
                      </span>
                    </div>
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
