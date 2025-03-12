import React, { useState, CSSProperties } from "react";
import backgroundImage from "../assets/GreenGradient.svg";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadStatus("");
    } else {
      setUploadStatus("Please select a PDF file");
    }
  };

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

    setUploadStatus("Uploading...");
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
      const response = await fetch("http://localhost:5001/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("File uploaded successfully!");
        setUploadedFileName(data.filename);
        setSelectedFile(null);
      } else {
        setUploadStatus(data.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      setUploadStatus("Error uploading file. Please try again.");
      console.error("Upload error:", error);
    }

    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleAnalyze = async () => {
    if (!uploadedFileName) {
      setUploadStatus("Please upload a file first");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setUploadStatus("Analyzing PDF...");
    setShowPopup(true);

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setUploadStatus("Please log in to analyze files");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    try {
      const extractResponse = await fetch(
        `http://localhost:5001/api/process-pdf/${uploadedFileName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const extractData = await extractResponse.json();

      if (extractResponse.ok) {
        setUploadStatus(
          `Success! Added ${extractData.transactions_count} transactions to your budget.`
        );
        setUploadedFileName(null);
      } else {
        setUploadStatus(
          extractData.error || "Analysis failed. Please try again."
        );
      }
    } catch (error) {
      setUploadStatus("Error analyzing file. Please try again.");
      console.error("Analysis error:", error);
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
    buttonContainer: {
      display: "flex",
      gap: "10px",
      width: "100%",
      justifyContent: "center",
    },
    analyzeButton: {
      padding: "12px 24px",
      backgroundColor: uploadedFileName ? "#00C49F" : "#666",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: uploadedFileName ? "pointer" : "not-allowed",
      fontSize: "16px",
      transition: "background-color 0.2s",
    },
  };

  return (
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
        <div style={styles.buttonContainer}>
          <button style={styles.button} onClick={handleButtonClick}>
            {selectedFile ? "Upload PDF" : "Select PDF"}
          </button>
          <button
            style={styles.analyzeButton}
            onClick={handleAnalyze}
            disabled={!uploadedFileName}
          >
            Analyze PDF
          </button>
        </div>
      </div>

      {showPopup && uploadStatus && (
        <div
          style={{
            ...styles.popup,
            ...(uploadStatus.includes("success")
              ? styles.successPopup
              : styles.errorPopup),
          }}
        >
          {uploadStatus.includes("success") ? <span>✓</span> : <span>⚠️</span>}
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
