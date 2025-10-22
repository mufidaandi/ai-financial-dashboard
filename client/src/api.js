import axios from "axios";
import { tokenManager } from './utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:3000/api";

const API = axios.create({ baseURL: API_BASE_URL });

// Request interceptor to attach token automatically
API.interceptors.request.use(async (req) => {
  try {
    // Skip token attachment for auth endpoints
    const isAuthEndpoint = req.url?.includes('/auth/login') || 
                          req.url?.includes('/auth/register') || 
                          req.url?.includes('/auth/refresh');
    
    if (!isAuthEndpoint) {
      const accessToken = await tokenManager.getValidAccessToken();
      if (accessToken) {
        req.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  } catch (err) {
    console.error('Error attaching token to request:', err);
    // Let the request proceed without token for public endpoints
  }
  
  return req;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Skip refresh for auth endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                              originalRequest.url?.includes('/auth/register') || 
                              originalRequest.url?.includes('/auth/refresh');
        
        if (!isAuthEndpoint) {
          const newAccessToken = await tokenManager.refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        tokenManager.clearTokens();
        if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    // For other errors or if retry failed
    if (error.response?.status === 401) {
      tokenManager.clearTokens();
      if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default API;
