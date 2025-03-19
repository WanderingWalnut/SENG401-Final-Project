import React, { useState, useEffect } from "react";
import profileIcon from "../../assets/profile.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios for API calls

const Navbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch username from API if not stored in localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("user_name");

    if (storedName) {
      setUserName(storedName);
    } else {
      fetchUserName();
    }
  }, []);

  // Function to fetch username from API
  const fetchUserName = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) return;

    try {
      const response = await axios.get(`http://127.0.0.1:5001/api/get-user/${userId}`);
      if (response.data.name) {
        setUserName(response.data.name);
        localStorage.setItem("user_name", response.data.name); // Cache username
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    localStorage.clear(); // Clear all stored data
    navigate("/login");
    window.location.reload();
  };

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      height: "72px", width: "100%", backgroundColor: "#ffffff",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", 
      position: "fixed", top: 0, left: 0, zIndex: 1000
    }}>
      <div 
        style={{ fontWeight: "bold", fontSize: "24px", color: "#00C49F", cursor: "pointer", marginLeft: "20px", }} 
        onClick={() => navigate("/")}
      >
        BudgetWise
      </div>
      <div 
        style={{ position: "relative", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginRight: "20px" }} 
        onClick={toggleDropdown}
      >
        {userName ? <span style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>{userName}</span> : <span>Loading...</span>}
        <img src={profileIcon} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
        {dropdownOpen && (
          <div style={{
            position: "absolute", top: "50px", right: "0",
            backgroundColor: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px", width: "150px", padding: "10px 0"
          }}>
            <div style={{ padding: "12px", color: "#d9534f", fontWeight: "bold", cursor: "pointer" }} onClick={handleSignOut}>
              Sign Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
