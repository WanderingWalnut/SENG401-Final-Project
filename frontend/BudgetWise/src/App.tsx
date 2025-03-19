import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUpPage";
import ChatPage from "./pages/chatPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/landingPage";
import UploadPage from "./pages/UploadPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage/>} />
        <Route path="/upload" element={<UploadPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
