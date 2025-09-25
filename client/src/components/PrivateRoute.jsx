// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import authService from "../services/authService";
import { isTokenExpired } from "../utils/authUtils";

function PrivateRoute({ children }) {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!storedUser || !storedUser.token || isTokenExpired(storedUser.token)) {
    authService.logout();
    return <Navigate to="/" replace />; // redirect to login
  }

  return children;
}

export default PrivateRoute;
