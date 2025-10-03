import { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isTokenExpired } from "../utils/jwtUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user")) || null;
    // Handle both old format (flat) and new format (nested)
    if (stored && stored.user) {
      // New format: merge token with user data
      return { ...stored.user, token: stored.token };
    }
    return stored;
  });

  // Global token expiration check
  useEffect(() => {
    if (!user?.token) return;

    // Check if current token is expired
    if (isTokenExpired(user.token)) {
      logout();
      return;
    }

    // Set up periodic check for token expiration
    const checkToken = () => {
      if (user?.token && isTokenExpired(user.token)) {
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [user?.token]);

  const login = (data) => {
    let userData;
    // Handle both response formats
    if (data.user) {
      // New format: merge token with user data
      userData = { ...data.user, token: data.token };
    } else {
      // Old format: data is already flat
      userData = data;
    }
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(data)); // Store original format
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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
