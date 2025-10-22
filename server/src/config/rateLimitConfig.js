// src/config/rateLimitConfig.js
/**
 * Rate limiting configuration constants and utilities
 * Centralizes all rate limit settings to eliminate duplication
 */

import { RATE_LIMIT_WINDOWS } from '../constants/timeConstants.js';
import { RATE_LIMITS } from '../constants/configConstants.js';

// Environment-based development flag
export const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  GENERAL: {
    windowMs: RATE_LIMIT_WINDOWS.SHORT,
    maxDev: RATE_LIMITS.GENERAL.DEVELOPMENT,
    maxProd: RATE_LIMITS.GENERAL.PRODUCTION,
    type: 'general'
  },
  AUTH: {
    windowMs: RATE_LIMIT_WINDOWS.SHORT,
    max: RATE_LIMITS.AUTH,
    type: 'authentication',
    skipSuccessfulRequests: true
  },
  API: {
    windowMs: RATE_LIMIT_WINDOWS.SHORT,
    maxDev: RATE_LIMITS.API.DEVELOPMENT,
    maxProd: RATE_LIMITS.API.PRODUCTION,
    type: 'API'
  },
  STRICT: {
    windowMs: RATE_LIMIT_WINDOWS.SHORT,
    maxDev: RATE_LIMITS.STRICT.DEVELOPMENT,
    maxProd: RATE_LIMITS.STRICT.PRODUCTION,
    type: 'resource-intensive'
  },
  PASSWORD_RESET: {
    windowMs: RATE_LIMIT_WINDOWS.LONG,
    max: RATE_LIMITS.PASSWORD_RESET,
    type: 'password reset'
  }
};

/**
 * Generate error message for rate limit type
 * @param {string} type - Type of rate limit (e.g., 'general', 'authentication')
 * @param {string} retryAfter - Retry after duration string
 * @returns {string} - Formatted error message
 */
export const generateErrorMessage = (type, retryAfter) => {
  const messages = {
    general: 'Too many requests from this IP, please try again later.',
    authentication: 'Too many authentication attempts from this IP, please try again later.',
    API: 'Too many API requests from this IP, please try again later.',
    'resource-intensive': 'Too many resource-intensive requests from this IP, please try again later.',
    'password reset': 'Too many password reset attempts from this IP, please try again later.',
    user: 'Too many requests from this user, please try again later.'
  };
  
  return messages[type] || messages.general;
};

/**
 * Generate retry after string from windowMs
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {string} - Human readable retry after string
 */
export const generateRetryAfter = (windowMs) => {
  const minutes = Math.ceil(windowMs / (60 * 1000));
  return minutes >= 60 ? `${Math.ceil(minutes / 60)} hour${minutes >= 120 ? 's' : ''}` : `${minutes} minutes`;
};

/**
 * Get max requests based on environment and configuration
 * @param {Object} config - Rate limit configuration object
 * @returns {number} - Maximum requests allowed
 */
export const getMaxRequests = (config) => {
  if (config.max !== undefined) {
    return config.max; // Fixed value for all environments
  }
  return isDevelopment ? config.maxDev : config.maxProd;
};