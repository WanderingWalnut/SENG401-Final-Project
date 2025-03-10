import React, { CSSProperties } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import "../App.css";
import backgroundImage from "../assets/GreenGradient.svg";

const lineData = [
    { month: "Jan", savings: 200 },
    { month: "Feb", savings: 150 },
    { month: "Mar", savings: 300 },
    { month: "Apr", savings: 250 },
    { month: "May", savings: 400 },
];

const pieData = [
    { name: "Health & Recreation", value: 200 },
    { name: "Restaurants", value: 400 },
    { name: "Entertainment", value: 300 },
    { name: "Retail & Grocery", value: 500 },
    { name: "Financial Services", value: 150 },
    { name: "Personal Expenses", value: 350 },
];

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#FF4444", "#AA66CC"];

const ChatPage = () => {
    const styles: { [key: string]: CSSProperties } = {
        chatPageContainer: {
            display: "flex",
            flexWrap: "wrap",
            height: "100vh",
            width: "100%",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover", 
            backgroundRepeat: "no-repeat", 
            backgroundPosition: "center", 
            color: "white",
            padding: "10px",
            boxSizing: "border-box",
        },
        leftSection: {
            width: "100%",
            maxWidth: "500px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: "10px",
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #444",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
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
        rightSection: {
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: "2px solid #444",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
        },
    };

    return (
        <div style={styles.chatPageContainer}>
            <div style={styles.leftSection}>
                <div style={styles.topLeftBox}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData}>
                            <XAxis dataKey="month" stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip />
                            <Line type="monotone" dataKey="savings" stroke="#00C49F" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={styles.bottomLeftBox}>
                    <div style={styles.summaryTitle}>Expense Summary</div>
                    <PieChart width={200} height={200}>
                        <Pie data={pieData} cx={100} cy={100} innerRadius={40} outerRadius={80} fill="#8884d8" dataKey="value">
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                    <div style={styles.totalExpense}>Total: $8900</div>
                    <div style={styles.expenseSummary}>
                        <div>
                            <p>Health & Rec: $200</p>
                            <p>Restaurants: $400</p>
                            <p>Entertainment: $300</p>
                        </div>
                        <div>
                            <p>Grocery: $500</p>
                            <p>Financial Services: $150</p>
                            <p>Personal Expenses: $350</p>
                        </div>
                    </div>
                </div>
            </div>
            <div style={styles.rightSection}>Right Box</div>
        </div>
    );
};

export default ChatPage;
