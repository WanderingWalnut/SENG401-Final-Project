import React, { CSSProperties } from "react";
import "../App.css";

const ChatPage = () => {
    const styles: { [key: string]: CSSProperties } = {
        chatPageContainer: {
            display: "flex",
            height: "100vh",
            width: "100%",
            backgroundColor: "#1e1e1e",
            color: "white",
            padding: "10px",
            boxSizing: "border-box", // Now correctly typed
        },
        leftSection: {
            width: "30%",
            display: "flex",
            flexDirection: "column",
            height: "100%",
        },
        topLeftBox: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #333",
            backgroundColor: "#292929",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "5px",
        },
        bottomLeftBox: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #333",
            backgroundColor: "#292929",
            borderRadius: "10px",
            padding: "20px",
            marginTop: "5px",
        },
        rightSection: {
            width: "70%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#242424",
            borderLeft: "2px solid #333",
            borderRadius: "10px",
            marginLeft: "10px",
            padding: "20px",
        },
    };

    return (
        <div style={styles.chatPageContainer}>
            <div style={styles.leftSection}>
                <div style={styles.topLeftBox}>Top Left Box</div>
                <div style={styles.bottomLeftBox}>Bottom Left Box</div>
            </div>
            <div style={styles.rightSection}>Right Box</div>
        </div>
    );
};

export default ChatPage;
