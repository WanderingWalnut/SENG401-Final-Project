import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useEffect,
} from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import profileIcon from "../../assets/profile.svg";
import Logo from "../../assets/logo.min.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/chat")) setActiveTab("Home");
    else if (path.includes("/upload")) setActiveTab("Upload");
    else if (path.includes("/transactions")) setActiveTab("Transactions");
  }, [location]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav style={styles.navbarContainer}>
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "100px", height: "100px", marginRight: "10px", transform: "rotate(-30deg)" }}  
          />
      <div style={styles.navbarWrapper}>
        
        <ul
          style={styles.navbar}
          onMouseLeave={() => {
            setPosition((prev) => ({ ...prev, opacity: 1 }));
          }}
        >
          <Tab
            setPosition={setPosition}
            onClick={() => navigate("/chat")}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          >
            Home
          </Tab>
          <Tab
            setPosition={setPosition}
            onClick={() => navigate("/upload")}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          >
            Upload
          </Tab>
          <Tab
            setPosition={setPosition}
            onClick={() => navigate("/transactions")}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          >
            Transactions
          </Tab>
          <Cursor position={position} />
        </ul>
      </div>
      <div style={styles.profileContainer} onClick={toggleDropdown}>
        {userName ? (
          <span style={styles.userName}>{userName}</span>
        ) : (
          <span>Loading...</span>
        )}
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
  activeTab,
}: {
  children: string;
  setPosition: Dispatch<
    SetStateAction<{ left: number; width: number; opacity: number }>
  >;
  onClick: () => void;
  setActiveTab: Dispatch<SetStateAction<string | null>>;
  activeTab: string | null;
}) => {
  const ref = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (activeTab === children && ref.current) {
      const { width } = ref.current.getBoundingClientRect();
      setPosition({
        left: ref.current.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [activeTab, setPosition]);

  return (
    <li
      ref={ref}
      style={{
        ...styles.tab,
        color: activeTab === children ? "white" : "#94A3B8",
      }}
      onClick={() => {
        onClick();
        setActiveTab(children);
      }}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
    >
      <span style={styles.tabText}>{children}</span>
    </li>
  );
};

const Cursor = ({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) => {
  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={position}
      style={styles.cursor}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    />
  );
};

const styles = {
  navbarContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#0F172A",
    borderBottom: "1px solid #334155",
  },
  navbarWrapper: {
    display: "flex",
    justifyContent: "center",
    flexGrow: 1,
  },
  navbar: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #334155",
    backgroundColor: "#1E293B",
    borderRadius: "30px",
    padding: "5px",
    listStyle: "none",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
    backgroundColor: "#00C49F",
    borderRadius: "20px",
    zIndex: 1,
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    marginLeft: "auto",
    position: "relative",
  },
  userName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#E2E8F0",
    marginRight: "10px",
  },
  profileIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#334155",
    padding: "8px",
  },
  dropdownMenu: {
    position: "absolute",
    top: "50px",
    right: "0",
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
    width: "150px",
    padding: "10px 0",
    zIndex: 100,
  },
  logoutOption: {
    padding: "12px",
    color: "#FF4444",
    fontWeight: "bold",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(255, 68, 68, 0.1)",
    },
  },
};

export default Navbar;
