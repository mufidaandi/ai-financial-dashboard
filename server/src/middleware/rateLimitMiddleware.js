import rateLimit from 'express-rate-limit';
import { 
  RATE_LIMIT_CONFIGS, 
  generateErrorMessage, 
  generateRetryAfter, 
  getMaxRequests
} from '../config/rateLimitConfig.js';
import { RATE_LIMIT_WINDOWS } from '../constants/timeConstants.js';

/**
 * Create a standardized rate limiter with consistent configuration
 * @param {Object} config - Rate limit configuration
 * @param {Object} options - Additional options (keyGenerator, etc.)
 * @returns {Function} - Express rate limiter middleware
 */
const createRateLimiter = (config, options = {}) => {
  const maxRequests = getMaxRequests(config);
  const retryAfter = generateRetryAfter(config.windowMs);
  const errorMessage = generateErrorMessage(config.type, retryAfter);
  
  return rateLimit({
    windowMs: config.windowMs,
    max: maxRequests,
    message: {
      error: errorMessage,
      retryAfter
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Remove custom keyGenerator to use express-rate-limit's default IPv6-safe implementation
    // The default keyGenerator automatically handles IPv6 addresses correctly
    handler: (req, res) => {
      res.status(429).json({
        error: errorMessage,
        retryAfter
      });
    },
    // Merge any additional options
    ...options,
    // Override with config-specific options
    ...(config.skipSuccessfulRequests && { skipSuccessfulRequests: true })
  });
};

// Create all rate limiters using the standardized function
export const generalLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.GENERAL);

export const authLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.AUTH);

export const apiLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.API);

export const strictLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.STRICT);

export const passwordResetLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.PASSWORD_RESET);

// Create a user-based rate limiter for authenticated endpoints
export const createUserBasedLimiter = (maxRequests = 100, windowMs = RATE_LIMIT_WINDOWS.SHORT) => {
  const retryAfter = generateRetryAfter(windowMs);
  const errorMessage = generateErrorMessage('user', retryAfter);
  
  return createRateLimiter(
    { windowMs, max: maxRequests, type: 'user' },
    {
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise fall back to IP
        return req.user?.id || req.ip;
      }
    }
  );
};

// Export individual limiters for specific use cases
export default {
  general: generalLimiter,
  auth: authLimiter,
  api: apiLimiter,
  strict: strictLimiter,
  passwordReset: passwordResetLimiter,
  createUserBased: createUserBasedLimiter
};