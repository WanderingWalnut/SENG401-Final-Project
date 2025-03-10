import { useState, useEffect } from "react";

import "./App.css";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import SignUp from "./pages/SignUpPage"; // Import the SignUpPage component
import ChatPage from "./pages/chatPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/landingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />

        
      </Routes>
    </Router>
  );
}

export default App;
