import React, { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import profileIcon from "../../assets/profile.svg";

const Navbar = () => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav style={styles.navbarContainer}>
      <ul
        style={styles.navbar}
        onMouseLeave={() => {
          setPosition((prev) => ({ ...prev, opacity: 0 }));
          setActiveTab(null);
        }}
      >
        <Tab setPosition={setPosition} onClick={() => navigate("/chat")} setActiveTab={setActiveTab} activeTab={activeTab}>Home</Tab>
        <Tab setPosition={setPosition} onClick={() => navigate("/upload")} setActiveTab={setActiveTab} activeTab={activeTab}>Upload</Tab>
        <Tab setPosition={setPosition} onClick={() => navigate("/history")} setActiveTab={setActiveTab} activeTab={activeTab}>History</Tab>
        <Cursor position={position} />
      </ul>
      <div style={styles.profileContainer} onClick={toggleDropdown}>
        {userName ? <span style={styles.userName}>{userName}</span> : <span>Loading...</span>}
        <img src={profileIcon} alt="Profile" style={styles.profileIcon} />
        {dropdownOpen && (
          <div style={styles.dropdownMenu}>
            <div style={styles.logoutOption} onClick={handleSignOut}>
              Sign Out
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Tab = ({
  children,
  setPosition,
  onClick,
  setActiveTab,
  activeTab
}: {
  children: string;
  setPosition: Dispatch<SetStateAction<{ left: number; width: number; opacity: number }>>;
  onClick: () => void;
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  activeTab: string | null;
}) => {
  const ref = useRef<HTMLLIElement | null>(null);

  return (
    <li
      ref={ref}
      style={{
        ...styles.tab,
        color: activeTab === children ? "white" : "black",
      }}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
        setActiveTab(children);
      }}
    >
      <span style={styles.tabText}>{children}</span>
    </li>
  );
};

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
  return (
    <motion.li
      animate={position}
      style={styles.cursor}
    />
  );
};

const styles = {
  navbarContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "white",
    borderBottom: "4px solid black",
  },
  navbar: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid black",
    backgroundColor: "white",
    borderRadius: "30px",
    padding: "5px",
    listStyle: "none",
  },
  tab: {
    position: "relative",
    cursor: "pointer",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "uppercase",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.3s ease",
  },
  tabText: {
    position: "relative",
    zIndex: 11,
  },
  cursor: {
    position: "absolute",
    height: "80%",
    backgroundColor: "black",
    borderRadius: "20px",
    zIndex: 1,
  },
  profileContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  userName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    marginRight: "10px",
  },
  profileIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  dropdownMenu: {
    position: "absolute",
    top: "50px",
    right: "0",
    backgroundColor: "white",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
    width: "150px",
    padding: "10px 0",
  },
  logoutOption: {
    padding: "12px",
    color: "#d9534f",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Navbar;
