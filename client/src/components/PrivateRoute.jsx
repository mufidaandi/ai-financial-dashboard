// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { tokenManager } from "../utils/tokenManager";

function PrivateRoute({ children }) {
  const tokens = tokenManager.getTokens();
  
  // Check if user has tokens and if refresh token is still valid
  if (!tokens || !tokens.accessToken || tokenManager.isRefreshTokenExpired()) {
    tokenManager.clearTokens();
    return <Navigate to="/" replace />; // redirect to login
  }

  return children;
}

export default PrivateRoute;
