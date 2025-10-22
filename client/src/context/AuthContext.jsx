import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { tokenManager } from "../utils/tokenManager";
import { AUTH_TIMEOUTS } from "../constants/timeConstants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user")) || null;
    
    // Handle backward compatibility with old token format
    if (stored && stored.token && !stored.accessToken) {
      // Old format - convert to new format
      const converted = {
        accessToken: stored.token,
        refreshToken: null, // Will need to login again
        user: stored.user || {
          id: stored.id,
          name: stored.name,
          email: stored.email,
          country: stored.country,
          currency: stored.currency
        }
      };
      localStorage.setItem("user", JSON.stringify(converted));
      return converted.user;
    }
    
    // New format
    if (stored && stored.user) {
      return stored.user;
    }
    
    return stored?.user || null;
  });

  // Global token expiration check with automatic refresh
  useEffect(() => {
    if (!user) return;

    const checkAndRefreshToken = async () => {
      try {
        // Check if refresh token is expired
        if (tokenManager.isRefreshTokenExpired()) {
          logout();
          return;
        }

        // If access token is expired, try to refresh
        if (tokenManager.isAccessTokenExpired()) {
          await tokenManager.refreshAccessToken();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Set up periodic check every 5 minutes
    const interval = setInterval(checkAndRefreshToken, AUTH_TIMEOUTS.TOKEN_REFRESH_CHECK);
    return () => clearInterval(interval);
  }, [user]);

  const login = (data) => {
    let userData;
    
    // Handle new token format with accessToken and refreshToken
    if (data.accessToken && data.refreshToken) {
      userData = data.user;
      tokenManager.setTokens(data.accessToken, data.refreshToken, data.user);
    } else if (data.user && data.token) {
      // Old format - store for backward compatibility
      userData = data.user;
      const legacyData = {
        accessToken: data.token,
        refreshToken: null,
        user: data.user
      };
      localStorage.setItem("user", JSON.stringify(legacyData));
    } else {
      // Fallback
      userData = data.user || data;
      localStorage.setItem("user", JSON.stringify(data));
    }
    
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    tokenManager.clearTokens();
    // Only redirect if not already on public pages
    if (location.pathname !== '/' && location.pathname !== '/register') {
      navigate('/', { replace: true });
    }
  };

  const updateUser = (userData) => {
    // Merge new data with existing user, preserving token
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Update localStorage - always use simple flat format for compatibility
    if (userData.token) {
      // Token update - store in simple flat format
      const newStoredData = { ...updatedUser };
      localStorage.setItem("user", JSON.stringify(newStoredData));
    } else {
      // Non-token update - preserve existing storage format
      const currentStored = JSON.parse(localStorage.getItem("user")) || {};
      if (currentStored.user) {
        // New format: update user data only
        const updatedStored = {
          ...currentStored,
          user: { ...currentStored.user, ...userData }
        };
        localStorage.setItem("user", JSON.stringify(updatedStored));
      } else {
        // Old format: update directly
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
