import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import "../App.css";

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
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const handleSendMessage = () => {
        if (input.trim() !== "") {
            setMessages([...messages, { text: input, sender: "user" }]);
            setInput("");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="left-panel">
                <h1 className="title">Budget Overview</h1>
                <div className="line-chart-section">
                    <h3>Monthly Savings</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={lineData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="savings" stroke="#00C49F" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="pie-chart-section">
                    <h3>Expense Summary</h3>
                    <PieChart width={300} height={300}>
                        <Pie data={pieData} cx={150} cy={150} innerRadius={60} outerRadius={100} fill="#8884d8" dataKey="value">
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </div>
            </div>
            <div className="right-panel chat-box">
                <h2>Chat Assistant</h2>
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>{msg.text}</div>
                    ))}
                </div>
                <div className="chat-input">
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
