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
    container: {
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box",
    },
    uploadBox: {
      width: "100%",
      maxWidth: "600px",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: "12px",
      padding: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      border: "1px solid #444",
    },
    dropZone: {
      width: "100%",
      height: "200px",
      border: `2px dashed ${isDragging ? "#00C49F" : "#666"}`,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      cursor: "pointer",
      backgroundColor: isDragging
        ? "rgba(0, 196, 159, 0.1)"
        : "rgba(255, 255, 255, 0.1)",
      transition: "all 0.3s ease",
    },
    title: {
      color: "white",
      fontSize: "24px",
      marginBottom: "20px",
      textAlign: "center",
    },
    uploadText: {
      color: "white",
      marginBottom: "10px",
      textAlign: "center",
    },
    fileInput: {
      display: "none",
    },
    button: {
      padding: "12px 24px",
      backgroundColor: "#00C49F",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      transition: "background-color 0.2s",
    },
    selectedFile: {
      color: "white",
      marginTop: "10px",
      textAlign: "center",
    },
    status: {
      color: uploadStatus.includes("success") ? "#00C49F" : "#ff4444",
      marginTop: "10px",
      textAlign: "center",
    },
    popup: {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "15px 25px",
      borderRadius: "8px",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      zIndex: 1000,
      animation: "slideIn 0.3s ease-out",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      transform: "translateX(0)",
      opacity: 1,
      transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
    },
    successPopup: {
      backgroundColor: "rgba(0, 196, 159, 0.9)",
    },
    errorPopup: {
      backgroundColor: "rgba(255, 68, 68, 0.9)",
    },
    "@keyframes slideIn": {
      from: {
        transform: "translateX(100%)",
        opacity: 0,
      },
      to: {
        transform: "translateX(0)",
        opacity: 1,
      },
    },
  };

  return (
    <div style={styles.container}>
      <Navbar />
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
        <button style={styles.button} onClick={handleButtonClick}>
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
          {uploadStatus.includes("Success") ? <span>✓</span> : <span>⚠️</span>}
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
