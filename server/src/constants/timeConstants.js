// src/constants/timeConstants.js
/**
 * Centralized time constants to eliminate magic numbers across the application
 */

// Base time units (in milliseconds)
export const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
};

// Cache TTL constants (Time To Live)
export const CACHE_TTL = {
  // Short-term cache (1-5 minutes)
  VERY_SHORT: 1 * TIME_UNITS.MINUTE,       // 1 minute
  SHORT: 2 * TIME_UNITS.MINUTE,            // 2 minutes
  DEFAULT: 5 * TIME_UNITS.MINUTE,          // 5 minutes
  
  // Medium-term cache (3-10 minutes)
  CATEGORIES: 10 * TIME_UNITS.MINUTE,      // 10 minutes - categories don't change often
  ACCOUNTS: 5 * TIME_UNITS.MINUTE,         // 5 minutes - accounts change occasionally
  BUDGETS: 3 * TIME_UNITS.MINUTE,          // 3 minutes - budgets change more frequently
  BUDGET_PROGRESS: 2 * TIME_UNITS.MINUTE,  // 2 minutes - budget progress updates frequently
  BUDGET_SUMMARY: 2 * TIME_UNITS.MINUTE,   // 2 minutes - budget summary updates frequently
  TRANSACTIONS: 1 * TIME_UNITS.MINUTE,     // 1 minute - transactions change very frequently
  
  // Long-term cache (30 minutes - 24 hours)
  AI_INSIGHTS: 30 * TIME_UNITS.MINUTE,     // 30 minutes - AI insights are expensive to generate
  AI_CATEGORIES: 24 * TIME_UNITS.HOUR,     // 24 hours - AI category suggestions are stable
  AI_FALLBACK: 1 * TIME_UNITS.HOUR,        // 1 hour - fallback responses should retry sooner
  SUGGESTED_CATEGORIES: 4 * TIME_UNITS.HOUR // 4 hours - suggested categories don't change often
};

// Rate limiting time windows
export const RATE_LIMIT_WINDOWS = {
  SHORT: 15 * TIME_UNITS.MINUTE,           // 15 minutes - standard rate limit window
  LONG: 1 * TIME_UNITS.HOUR,               // 1 hour - for sensitive operations like password reset
  VERY_LONG: 24 * TIME_UNITS.HOUR          // 24 hours - for very sensitive operations
};

// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "15m",                     // 15 minutes - short-lived for security
  REFRESH_TOKEN: "7d",                     // 7 days - longer-lived for convenience
  PASSWORD_RESET: "1h",                    // 1 hour - temporary token for password reset
  EMAIL_VERIFICATION: "24h"                // 24 hours - email verification token
};

// Authentication and session timeouts
export const AUTH_TIMEOUTS = {
  SESSION_CHECK_INTERVAL: 5 * TIME_UNITS.MINUTE,  // 5 minutes - check token refresh
  LOGIN_TIMEOUT: 30 * TIME_UNITS.MINUTE,          // 30 minutes - auto-logout inactive users
  REMEMBER_ME_DURATION: 30 * TIME_UNITS.DAY       // 30 days - remember me functionality
};

// API and polling intervals
export const POLLING_INTERVALS = {
  REAL_TIME: 5 * TIME_UNITS.SECOND,        // 5 seconds - real-time updates
  FREQUENT: 30 * TIME_UNITS.SECOND,        // 30 seconds - frequent updates
  NORMAL: 2 * TIME_UNITS.MINUTE,           // 2 minutes - normal polling
  SLOW: 10 * TIME_UNITS.MINUTE             // 10 minutes - background sync
};

// Debounce and throttle delays
export const INTERACTION_DELAYS = {
  SEARCH_DEBOUNCE: 300,                    // 300ms - search input debounce
  SAVE_DEBOUNCE: 1000,                     // 1 second - auto-save debounce
  API_THROTTLE: 500,                       // 500ms - API call throttling
  BUTTON_DEBOUNCE: 200                     // 200ms - button click debounce
};