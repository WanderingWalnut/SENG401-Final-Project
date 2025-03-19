import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const navigate = useNavigate();

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
    justifyContent: "center",
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
};

export default Navbar;
