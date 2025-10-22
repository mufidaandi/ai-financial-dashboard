// src/services/authService.js
import API from "../api";
import { tokenManager } from "../utils/tokenManager";
import { CacheService } from "./cacheService";

// Helper function to handle authentication response and token storage
const handleAuthResponse = (responseData) => {
  // Handle new token format
  if (responseData.accessToken && responseData.refreshToken) {
    tokenManager.setTokens(responseData.accessToken, responseData.refreshToken, responseData.user);
  } else if (responseData.token) {
    // Backward compatibility with old format
    const legacyData = {
      accessToken: responseData.token,
      refreshToken: null,
      user: responseData.user
    };
    localStorage.setItem("user", JSON.stringify(legacyData));
  }
};

// Register
const register = async (userData) => {
  const res = await API.post("/auth/register", userData);
  
  handleAuthResponse(res.data);
  
  return res.data;
};

// Login
const login = async (userData) => {
  const res = await API.post("/auth/login", userData);
  
  handleAuthResponse(res.data);
  
  return res.data;
};

// Logout
const logout = () => {
  tokenManager.clearTokens();
  // Clear all cached data when user logs out
  CacheService.clearAll();
};

// Get stored user
const getStoredUser = () => {
  const tokens = tokenManager.getTokens();
  if (!tokens) return null;
  
  const stored = JSON.parse(localStorage.getItem("user"));
  return stored?.user || null;
};

// Refresh token
const refreshToken = async () => {
  return await tokenManager.refreshAccessToken();
};

export default { register, login, logout, getStoredUser, refreshToken };
