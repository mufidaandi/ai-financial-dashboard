import { isTokenExpired } from './jwtUtils';

class TokenManager {
  constructor() {
    this.refreshPromise = null;
  }

  getTokens() {
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      const userData = JSON.parse(user);
      return {
        accessToken: userData.accessToken || userData.token, // Backward compatibility
        refreshToken: userData.refreshToken
      };
    } catch (err) {
      console.error('Error parsing user tokens:', err);
      return null;
    }
  }

  setTokens(accessToken, refreshToken, user) {
    const userData = {
      accessToken,
      refreshToken,
      user
    };
    localStorage.setItem("user", JSON.stringify(userData));
  }

  clearTokens() {
    localStorage.removeItem("user");
  }

  async refreshAccessToken() {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const tokens = this.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this._performRefresh(tokens.refreshToken);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async _performRefresh(refreshToken) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update stored tokens
      this.setTokens(data.accessToken, data.refreshToken, data.user);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/';
      }
      
      throw error;
    }
  }

  isAccessTokenExpired() {
    const tokens = this.getTokens();
    if (!tokens?.accessToken) return true;
    
    return isTokenExpired(tokens.accessToken);
  }

  isRefreshTokenExpired() {
    const tokens = this.getTokens();
    if (!tokens?.refreshToken) return true;
    
    return isTokenExpired(tokens.refreshToken);
  }

  async getValidAccessToken() {
    const tokens = this.getTokens();
    
    if (!tokens) {
      throw new Error('No tokens available');
    }

    // If access token is still valid, return it
    if (!this.isAccessTokenExpired()) {
      return tokens.accessToken;
    }

    // If refresh token is expired, user needs to login again
    if (this.isRefreshTokenExpired()) {
      this.clearTokens();
      throw new Error('Refresh token expired');
    }

    // Refresh the access token
    return await this.refreshAccessToken();
  }
}

export const tokenManager = new TokenManager();