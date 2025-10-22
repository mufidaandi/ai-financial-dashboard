// src/constants/configConstants.js
/**
 * Configuration constants for backend services
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  // Development vs Production multipliers
  DEVELOPMENT_MULTIPLIER: 2.5,  // 2.5x more lenient in development
  
  // General API limits (requests per window)
  GENERAL: {
    PRODUCTION: 200,
    DEVELOPMENT: 500
  },
  
  // API endpoint limits
  API: {
    PRODUCTION: 150,
    DEVELOPMENT: 300
  },
  
  // Resource-intensive operations (AI, file uploads, etc.)
  STRICT: {
    PRODUCTION: 10,
    DEVELOPMENT: 50
  },
  
  // Authentication attempts
  AUTH: 5,                    // Fixed for all environments
  
  // Password reset attempts
  PASSWORD_RESET: 3,          // Fixed for all environments
  
  // User-based default limits
  USER_BASED_DEFAULT: 100
};

// Database and connection settings
export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 30000,        // 30 seconds
  QUERY_TIMEOUT: 10000,            // 10 seconds
  MAX_CONNECTIONS: 10,             // Connection pool size
  RETRY_ATTEMPTS: 3,               // Connection retry attempts
  RETRY_DELAY: 1000               // 1 second between retries
};

// Bcrypt configuration
export const SECURITY_CONFIG = {
  BCRYPT_SALT_ROUNDS: 10,         // Standard salt rounds
  PASSWORD_MIN_LENGTH: 6,          // Minimum password length
  PASSWORD_MAX_LENGTH: 128,        // Maximum password length
  MAX_LOGIN_ATTEMPTS: 5,           // Account lockout threshold
  LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutes lockout
};

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_FILES_PER_REQUEST: 10,       // 10 files
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/csv'
  ]
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,           // Default items per page
  MAX_PAGE_SIZE: 100,              // Maximum items per page
  DEFAULT_PAGE: 1                  // Default page number
};

// API response limits
export const API_LIMITS = {
  MAX_SEARCH_RESULTS: 50,          // Maximum search results
  MAX_BULK_OPERATIONS: 100,        // Maximum bulk operations
  MAX_EXPORT_RECORDS: 10000       // Maximum records for export
};