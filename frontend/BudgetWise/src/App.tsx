import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUpPage";
import ChatPage from "./pages/chatPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/landingPage";
import UploadPage from "./pages/UploadPage";
import HistoryPage from "./pages/HistoryPage";
import PrivateRoute from "./components/ui/PrivateRoute"; 
import PublicRoute from "./components/ui/PublicRoute"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect if logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes - Requires Authentication */}
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
