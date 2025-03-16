import React from "react";
import profileIcon from "../../assets/profile.svg";

interface NavbarProps {
  username?: string;
}

const Navbar: React.FC<NavbarProps> = ({ username }) => {
  const styles = {
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "72px",
      width: "100%",
      backgroundColor: "white",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      padding: "0 24px",
      boxSizing: "border-box" as const,
      position: "fixed" as const,
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    logo: {
      fontWeight: "bold" as const,
      fontSize: "24px",
      color: "#00C49F",
    },
    profileContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    profileIcon: {
      width: "36px",
      height: "36px",
      cursor: "pointer",
    },
    username: {
      fontSize: "16px",
      color: "#333",
    },
  };

  return (
    <div style={styles.navbar}>
      <div 
        style={{...styles.logo, cursor: 'pointer'}} 
        onClick={() => window.location.href = '/'}>
        BudgetWise
      </div>
      <div style={styles.profileContainer}>
        {username && <span style={styles.username}>{username}</span>}
        <img src={profileIcon} alt="Profile" style={styles.profileIcon} />
      </div>
    </div>
  );
};

export default Navbar;
