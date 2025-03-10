import React from "react";
import GreenGradient from "../assets/GreenGradient.svg"; // Ensure correct path

const LandingPage = () => {
  return (
    <div style={styles.main}>
      <h1>Welcome to BudgetWise</h1>
      <h2>Save More. Live Better.</h2>
      <button style={styles.button}>Sign Up</button>
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
  },
};

export default LandingPage;
