// src/utils/jwtUtils.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_EXPIRY } from '../constants/timeConstants.js';
import { SECURITY_CONFIG } from '../constants/configConstants.js';

/**
 * JWT and authentication utility functions to eliminate duplication and centralize token management
 */

// JWT token expiration constants (imported from timeConstants)
export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: TOKEN_EXPIRY.ACCESS_TOKEN,
  REFRESH_TOKEN_EXPIRY: TOKEN_EXPIRY.REFRESH_TOKEN,
  FORGOT_PASSWORD_EXPIRY: TOKEN_EXPIRY.PASSWORD_RESET,
};

// Bcrypt configuration constants (imported from configConstants)
export const BCRYPT_CONSTANTS = {
  SALT_ROUNDS: SECURITY_CONFIG.BCRYPT_SALT_ROUNDS,
};

/**
 * Generate both access and refresh tokens for a user
 * @param {string} userId - The user's ID to encode in the token
 * @returns {Object} - Object containing accessToken and refreshToken
 */
export const generateTokenPair = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
  });
  
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
  });
  
  return { accessToken, refreshToken };
};

/**
 * Generate only an access token (for token refresh scenarios)
 * @param {string} userId - The user's ID to encode in the token
 * @returns {string} - Access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate only a refresh token
 * @param {string} userId - The user's ID to encode in the token
 * @returns {string} - Refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Generate a temporary token for password reset (1 hour expiry)
 * @param {string} userId - The user's ID to encode in the token
 * @returns {string} - Temporary access token
 */
export const generateTempToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_CONSTANTS.FORGOT_PASSWORD_EXPIRY,
  });
};

/**
 * Create standardized user response object
 * @param {Object} user - User object from database
 * @returns {Object} - Sanitized user object for API response
 */
export const createUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    country: user.country,
    currency: user.currency
  };
};

/**
 * Hash a password using bcrypt with standard salt rounds
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(BCRYPT_CONSTANTS.SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
};