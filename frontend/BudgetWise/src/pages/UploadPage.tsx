import React, { useState, CSSProperties, useEffect } from "react";
import backgroundImage from "../assets/GreenGradient.svg";
import Navbar from "../components/ui/navbar";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadStatus("");
    } else {
      setUploadStatus("Please select a PDF file");
    }
  };

  const getUser = async () => {
    const userId = localStorage.getItem("user_id") || "1";
    // For now, we'll just use a simple username based on the user ID
    // In a real app, you would fetch this from your backend
    setUsername(`User ${userId}`);
    return userId;
  };

  // Fetch user id when component mounts
  useEffect(() => {
    getUser();
  })

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadStatus("");
    } else {
      setUploadStatus("Please drop a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setUploadStatus("Uploading and processing...");
    setShowPopup(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setUploadStatus("Please log in to upload files");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    formData.append("user_id", userId);

    try {
      // Upload and process in one step
      const response = await fetch(
        "http://localhost:5001/api/upload-and-analyze-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUploadStatus(
          `Success! Added ${data.transactions_count} transactions to your budget.`
        );
        setSelectedFile(null);

        // Automatically trigger analysis after successful upload
        const analysisResponse = await fetch(
          `http://localhost:5001/api/analyze-spending/${userId}`,
          {
            method: "GET",
          }
        );

        const analysisData = await analysisResponse.json();

        if (analysisResponse.ok) {
          // Navigate to dashboard or show analysis
          window.location.href = "/chat";
        } else {
          console.error("Analysis failed:", analysisData.error);
        }
      } else {
        setUploadStatus(data.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      setUploadStatus("Error processing file. Please try again.");
      console.error("Upload error:", error);
    }

    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleButtonClick = () => {
    if (!selectedFile) {
      document.getElementById("fileInput")?.click();
    } else {
      handleUpload();
    }
  };

  const styles: { [key: string]: CSSProperties } = {
    pageWrapper: {
      width: "100%",
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    container: {
      flex: 1,
      width: "100%",
      backgroundColor: "#0F172A",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box",
    },
    uploadBox: {
      width: "100%",
      maxWidth: "600px",
      backgroundColor: "#1E293B", 
      borderRadius: "16px",
      padding: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      border: "1px solid #334155", // Dark border
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
    },
    dropZone: {
      width: "100%",
      height: "200px",
      border: `2px dashed ${isDragging ? "#00C49F" : "#475569"}`,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      cursor: "pointer",
      backgroundColor: isDragging ? "rgba(0, 196, 159, 0.1)" : "rgba(255, 255, 255, 0.05)",
      transition: "all 0.3s ease",
    },
    title: {
      color: "#E2E8F0", 
      fontSize: "24px",
      marginBottom: "20px",
      textAlign: "center",
      fontWeight: "600",
    },
    uploadText: {
      color: "#94A3B8",
      marginBottom: "10px",
      textAlign: "center",
      fontSize: "16px",
    },
    fileInput: {
      display: "none",
    },
    button: {
      padding: "16px 32px",
      backgroundColor: isHovered ? "#00b48f" : "#00C49F",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(0, 196, 159, 0.2)",
    },
    selectedFile: {
      color: "#E2E8F0",
      marginTop: "10px",
      textAlign: "center",
      fontSize: "14px",
    },
    status: {
      color: uploadStatus.includes("Success") ? "#00C49F" : "#FF4444", // Success/Error colors
      marginTop: "10px",
      textAlign: "center",
      fontWeight: "500",
    },
    popup: {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "15px 25px",
      borderRadius: "8px",
      backgroundColor: "#1E293B",
      border: "1px solid #334155",
      color: "#E2E8F0",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
    },
    successPopup: {
      borderColor: "#00C49F",
    },
    errorPopup: {
      borderColor: "#FF4444",
    },
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
    <div style={styles.container}>
      <div style={styles.uploadBox}>
        <h1 style={styles.title}>Upload Your Statement</h1>
        <div
          style={styles.dropZone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <p style={styles.uploadText}>
            Drag & Drop your PDF here or click to browse
          </p>
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={styles.fileInput}
          />
          {selectedFile && (
            <p style={styles.selectedFile}>Selected: {selectedFile.name}</p>
          )}
        </div>
        {uploadStatus && <p style={styles.status}>{uploadStatus}</p>}
        <button 
          style={styles.button}
          onClick={handleButtonClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {selectedFile ? "Upload & Process PDF" : "Select PDF"}
        </button>
      </div>

      {showPopup && uploadStatus && (
        <div
          style={{
            ...styles.popup,
            ...(uploadStatus.includes("Success")
              ? styles.successPopup
              : styles.errorPopup),
          }}
        >
          {uploadStatus.includes("Success") ? "✓" : "⚠️"}
          {uploadStatus}
        </div>
      )}
    </div>
    </div>
  );
};

export default UploadPage;