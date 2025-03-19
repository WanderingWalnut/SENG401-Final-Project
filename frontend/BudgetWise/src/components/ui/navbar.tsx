import React, { useState } from "react";
import profileIcon from "../../assets/profile.svg";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  username?: string;
}

const Navbar: React.FC<NavbarProps> = ({ username }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("user_id"); // Clear user session
    navigate("/login"); // Redirect to login page
    window.location.reload(); // Ensure state updates
  };
  

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
      cursor: "pointer",
    },
    profileContainer: {
      position: "relative" as const,
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
    dropdown: {
      position: "absolute" as const,
      top: "48px",
      right: 0,
      backgroundColor: "white",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      width: "120px",
      padding: "8px 0",
      display: dropdownOpen ? "block" : "none",
    },
    dropdownItem: {
      padding: "10px 16px",
      cursor: "pointer",
      fontSize: "14px",
      color: "#333",
      textAlign: "center" as const,
      borderBottom: "1px solid #eee",
    },
    lastItem: {
      borderBottom: "none",
    },
  };

  return (
    <div style={styles.navbar}>
      <div
        style={styles.logo}
        onClick={() => (window.location.href = "/")}
      >
        BudgetWise
      </div>
      <div style={styles.profileContainer}>
        {username && <span style={styles.username}>{username}</span>}
        <img
          src={profileIcon}
          alt="Profile"
          style={styles.profileIcon}
          onClick={toggleDropdown}
        />
        {dropdownOpen && (
          <div style={styles.dropdown}>
            <div style={{ ...styles.dropdownItem, ...styles.lastItem }} onClick={handleSignOut}>
              Sign Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;