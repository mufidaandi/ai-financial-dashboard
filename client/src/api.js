import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const API = axios.create({ baseURL: API_BASE_URL });

// attach token automatically
API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      // Handle both old and new token formats
      let token = null;
      
      if (userData.token) {
        // Direct token format
        token = userData.token;
      } else if (userData.user && userData.user.token) {
        // Nested user format
        token = userData.user.token;
      }
      
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }
  }
  return req;
});

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, it usually means the token is expired
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("user");
      // Only redirect if not already on login page
      if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
