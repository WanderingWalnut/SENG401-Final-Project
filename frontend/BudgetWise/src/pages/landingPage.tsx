import React from "react";
import GreenGradient from "../assets/GreenGradient.svg"; // Ensure correct path

const LandingPage = () => {
  return (
    <div style={styles.main}>
      <button style={styles.topRightButton}>
        <a href="/login" style={{ textDecoration: "none", color: "white" }}>Log In</a>
      </button>
      <h1>Welcome to BudgetWise</h1>
      <h2>Save More. Live Better.</h2>
      <button style={styles.button}><a href="/signup" style={{ textDecoration: "none", color: "white" }}>Sign Up</a></button>
    </div>
  );
};

const styles = {
  main: {
    height: "100vh", // Full height
    width: "100vw", // Full width
    backgroundImage: `url(${GreenGradient})`, // Set background image
    backgroundSize: "cover", // Cover full screen
    backgroundPosition: "center", // Center the image
    display: "flex", // Enables flexbox
    flexDirection: "column", // Stack items vertically
    alignItems: "center", // Center horizontally
    justifyContent: "center", // Center vertically
    textAlign: "center", // Ensure text is centered
    position: "relative", // Allow absolute positioning of the top right button
  },
  button: {
    color: "white",
    backgroundColor: "#04CA04",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "5px",
    marginTop: "10px",
    textDecoration: "none",
    hover: {
        backgroundColor: "yellow",
    }
  },
  topRightButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    color: "white",
    backgroundColor: "#04CA04",
    border: "none",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "5px",
  }

};

export default LandingPage;
