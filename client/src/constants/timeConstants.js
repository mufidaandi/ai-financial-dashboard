// src/constants/timeConstants.js
/**
 * Centralized time constants for frontend to eliminate magic numbers
 */

// Base time units (in milliseconds)
export const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
};

// Cache TTL constants (Time To Live)
export const CACHE_TTL = {
  // Short-term cache (1-5 minutes)
  TRANSACTIONS: 1 * TIME_UNITS.MINUTE,     // 1 minute - transactions change frequently
  BUDGET_PROGRESS: 2 * TIME_UNITS.MINUTE,  // 2 minutes - budget progress updates
  BUDGET_SUMMARY: 2 * TIME_UNITS.MINUTE,   // 2 minutes - budget summary updates
  BUDGETS: 3 * TIME_UNITS.MINUTE,          // 3 minutes - budgets change occasionally
  ACCOUNTS: 5 * TIME_UNITS.MINUTE,         // 5 minutes - accounts don't change often
  DEFAULT: 5 * TIME_UNITS.MINUTE,          // 5 minutes - default cache duration
  
  // Long-term cache (10 minutes - 24 hours)
  CATEGORIES: 10 * TIME_UNITS.MINUTE,      // 10 minutes - categories rarely change
  AI_INSIGHTS: 30 * TIME_UNITS.MINUTE,     // 30 minutes - AI insights
  AI_FALLBACK: 1 * TIME_UNITS.HOUR,        // 1 hour - fallback responses
  AI_CATEGORIES: 24 * TIME_UNITS.HOUR,     // 24 hours - AI category suggestions
  SUGGESTED_CATEGORIES: 4 * TIME_UNITS.HOUR // 4 hours - category suggestions
};

// Authentication and session timeouts
export const AUTH_TIMEOUTS = {
  TOKEN_REFRESH_CHECK: 5 * TIME_UNITS.MINUTE,  // 5 minutes - check token refresh
  SESSION_WARNING: 2 * TIME_UNITS.MINUTE,      // 2 minutes - warn before logout
  AUTO_LOGOUT: 30 * TIME_UNITS.MINUTE          // 30 minutes - auto-logout inactive users
};

// UI interaction delays and timeouts
export const UI_DELAYS = {
  // Debounce delays
  SEARCH_DEBOUNCE: 300,           // 300ms - search input debounce
  INPUT_DEBOUNCE: 500,            // 500ms - general input debounce
  SAVE_DEBOUNCE: 1000,            // 1 second - auto-save debounce
  
  // Animation durations
  TOAST_DURATION: 2000,           // 2 seconds - toast notification
  MODAL_ANIMATION: 200,           // 200ms - modal fade in/out
  BUTTON_FEEDBACK: 150,           // 150ms - button press feedback
  
  // Loading states
  LOADING_DELAY: 200,             // 200ms - show loading spinner after delay
  MINIMUM_LOADING: 500,           // 500ms - minimum loading time for UX
  NETWORK_TIMEOUT: 10000,         // 10 seconds - network request timeout
  
  // Polling and refresh intervals
  REAL_TIME_POLLING: 5000,        // 5 seconds - real-time data updates
  BACKGROUND_REFRESH: 60000,      // 1 minute - background data refresh
  HEALTH_CHECK: 30000             // 30 seconds - health check interval
};