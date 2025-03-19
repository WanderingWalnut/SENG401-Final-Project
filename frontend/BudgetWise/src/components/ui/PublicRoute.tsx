import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const isAuthenticated = localStorage.getItem("user_id"); // Check if user is logged in

  return isAuthenticated ? <Navigate to="/chat" replace /> : <Outlet />;
};

export default PublicRoute;
