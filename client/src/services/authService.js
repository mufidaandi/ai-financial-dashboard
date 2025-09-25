// src/services/authService.js
import axios from "axios";
import { isTokenExpired } from "../utils/authUtils";

const API_URL = "http://localhost:3000/api/auth";

const getStoredUser = () => {
  const stored = JSON.parse(localStorage.getItem("user"));
  if (!stored || isTokenExpired(stored.token)) {
    logout();
    return null;
  }
  return stored;
};

// Attach token automatically
axios.interceptors.request.use((config) => {
  const stored = getStoredUser();
  if (stored && stored.token) {
    config.headers.Authorization = `Bearer ${stored.token}`;
  }
  return config;
});

// Register
const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  if (res.data.token) localStorage.setItem("user", JSON.stringify(res.data));
  return res.data;
};

// Login
const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  if (res.data.token) localStorage.setItem("user", JSON.stringify(res.data));
  return res.data;
};

// Logout
const logout = () => {
  localStorage.removeItem("user");
};

export default { register, login, logout, getStoredUser };
