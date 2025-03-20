import { color } from "framer-motion";
import React, { useState } from "react";
import { FiArrowRight, FiCheckCircle, FiPieChart, FiTrendingUp } from "react-icons/fi";

const LandingPage = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoginHovered, setIsLoginHovered] = useState(false);

    return (
        <div style={styles.main}>
            {/* Navigation Bar */}
            <nav style={styles.nav}>
                <div style={styles.logo}>BudgetWise</div>
                <a
                    href="/login"
                    style={{ ...styles.loginButton, backgroundColor: isLoginHovered ? '#059669' : '#10B981' }}
                    onMouseEnter={() => setIsLoginHovered(true)}
                    onMouseLeave={() => setIsLoginHovered(false)}
                >
                    Log In
                </a>
            </nav>

            {/* Hero Section */}
            <div style={styles.hero}>
                <h1 style={styles.title}>Smart Money Management for Everyone</h1>
                <p style={styles.subtitle}>Take control of your finances with powerful budgeting tools and real-time insights</p>
                <a
                    href="/signup"
                    style={{ ...styles.ctaButton, transform: isHovered ? 'translateY(-2px)' : 'none' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Sign Up Now
                    <FiArrowRight style={styles.ctaIcon} />
                </a>
            </div>

            {/* Features Grid */}
            <div style={styles.features}>
                <div style={styles.featureCard}>
                    <FiPieChart style={styles.featureIcon} />
                    <h3 style={styles.featureTitle}>Expense Tracking</h3>
                    <p style={styles.featureText}>Automatically categorize and analyze your spending patterns</p>
                </div>
                <div style={styles.featureCard}>
                    <FiTrendingUp style={styles.featureIcon} />
                    <h3 style={styles.featureTitle}>Smart Budgeting</h3>
                    <p style={styles.featureText}>Create custom budgets that adapt to your spending habits</p>
                </div>
                <div style={styles.featureCard}>
                    <FiCheckCircle style={styles.featureIcon} />
                    <h3 style={styles.featureTitle}>Goal Tracking</h3>
                    <p style={styles.featureText}>Save for important goals with personalized recommendations</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    main: {
        minHeight: "100vh",
        background: "linear-gradient(90deg, #0F172A 0%, #1E293B 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "0 10%",
        position: "relative",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: "auto", // Allow scrolling in the container 
    },
    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "2rem 0",
    },
    logo: {
        color: "white",
        fontSize: "1.8rem",
        fontWeight: "700",
        letterSpacing: "1px",
    },
    loginButton: {
        padding: "0.8rem 1.5rem",
        borderRadius: "30px",
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        color: "white"
    },
    buttonLink: {
        textDecoration: "none",
        color: "white",
        fontSize: "1rem",
        fontWeight: "500",
    },
    hero: {
        textAlign: "center",
        padding: "8rem 0 4rem 0",
        maxWidth: "800px",
        margin: "0 auto",
    },
    title: {
        fontSize: "3.5rem",
        color: "white",
        marginBottom: "1.5rem",
        lineHeight: "1.2",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
    },
    subtitle: {
        fontSize: "1.4rem",
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: "3rem",
        lineHeight: "1.6",
        fontWeight: "300",
    },
    ctaButton: {
        padding: "1.2rem 2.5rem",
        borderRadius: "30px",
        border: "none",
        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 8px 15px rgba(16, 185, 129, 0.3)",
        color: "white",
    },
    ctaLink: {
        textDecoration: "none",
        color: "white",
        fontSize: "1.1rem",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
    },
    ctaIcon: {
        fontSize: "1.5rem",
        verticalAlign: "middle",
    },
    features: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
        padding: "4rem 0",
    },
    featureCard: {
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "15px",
        padding: "2rem",
        textAlign: "center",
        transition: "transform 0.3s ease",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    },
    featureIcon: {
        fontSize: "2.5rem",
        color: "#10B981",
        marginBottom: "1.5rem",
    },
    featureTitle: {
        fontSize: "1.4rem",
        color: "#1F2937",
        marginBottom: "1rem",
    },
    featureText: {
        fontSize: "1rem",
        color: "#4B5563",
        lineHeight: "1.6",
    },
    '@media (max-width: 768px)': {
        title: {
            fontSize: "2.5rem",
        },
        subtitle: {
            fontSize: "1.2rem",
        },
        hero: {
            padding: "4rem 0",
        },
        features: {
            gridTemplateColumns: "1fr",
            padding: "2rem 0",
        },
    },
    '@media (max-width: 480px)': {
        main: {
            padding: "0 5%",
        },
        logo: {
            fontSize: "1.4rem",
        },
        title: {
            fontSize: "2rem",
        },
        subtitle: {
            fontSize: "1rem",
        },
        ctaButton: {
            padding: "1rem 2rem",
        },
    },
};

export default LandingPage;