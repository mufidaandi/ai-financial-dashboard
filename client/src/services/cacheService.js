// src/services/cacheService.js
/**
 * Standardized caching service to eliminate inconsistent patterns
 * Provides unified caching interface for all services
 */

import { dataCache } from '../utils/dataCache.js';
import { CACHE_TTL } from '../constants/timeConstants.js';

/**
 * Cache strategy patterns
 */
export const CACHE_STRATEGIES = {
  // Service-specific methods (preferred for main data)
  SERVICE_METHOD: 'service_method',
  // Direct cache operations (for computed/derived data)
  DIRECT_CACHE: 'direct_cache'
};

/**
 * Standardized cache keys to prevent inconsistencies
 */
export const CACHE_KEYS = {
  // Core data entities
  CATEGORIES: 'categories',
  ACCOUNTS: 'accounts', 
  BUDGETS: 'budgets',
  TRANSACTIONS: 'transactions',
  
  // Computed/derived data
  BUDGET_PROGRESS: 'budgetProgress',
  BUDGET_SUMMARY: 'budgetSummary',
  
  // AI-related data
  AI_INSIGHTS: 'ai_insights',
  AI_SUGGESTED_CATEGORIES: 'ai_suggested_categories',
  
  // Dynamic keys (use with ID)
  BUDGET_BY_ID: (id) => `budget_${id}`,
  AI_CATEGORY_SUGGESTION: (description, type) => `ai_category_${description.toLowerCase().trim()}_${type}`
};

/**
 * Unified caching interface
 */
export class CacheService {
  /**
   * Get cached data with fallback to API call
   * @param {string} cacheKey - Cache key to use
   * @param {Function} apiCall - Function that returns a Promise with fresh data
   * @param {number} ttl - Time to live in milliseconds
   * @param {string} strategy - Caching strategy to use
   * @returns {Promise} - Cached or fresh data
   */
  static async getCachedData(cacheKey, apiCall, ttl, strategy = CACHE_STRATEGIES.DIRECT_CACHE) {
    switch (strategy) {
      case CACHE_STRATEGIES.SERVICE_METHOD:
        // Use dataCache service methods for main entities
        return await this._getViaServiceMethod(cacheKey, apiCall);
        
      case CACHE_STRATEGIES.DIRECT_CACHE:
      default:
        // Use direct cache operations for computed data
        return await this._getViaDirectCache(cacheKey, apiCall, ttl);
    }
  }

  /**
   * Use dataCache service methods (for main entities like categories, accounts, etc.)
   */
  static async _getViaServiceMethod(cacheKey, apiCall) {
    const methodMap = {
      [CACHE_KEYS.CATEGORIES]: () => dataCache.getCategories(apiCall),
      [CACHE_KEYS.ACCOUNTS]: () => dataCache.getAccounts(apiCall),
      [CACHE_KEYS.BUDGETS]: () => dataCache.getBudgets(apiCall),
      [CACHE_KEYS.TRANSACTIONS]: () => dataCache.getTransactions(apiCall),
      [CACHE_KEYS.AI_INSIGHTS]: () => dataCache.getSpendingInsights(apiCall),
      [CACHE_KEYS.AI_SUGGESTED_CATEGORIES]: () => dataCache.getSuggestedCategories(apiCall)
    };

    const method = methodMap[cacheKey];
    if (method) {
      return await method();
    }
    
    // Fallback to direct cache if no service method available
    return await this._getViaDirectCache(cacheKey, apiCall, CACHE_TTL.DEFAULT);
  }

  /**
   * Use direct cache operations (for computed/derived data)
   */
  static async _getViaDirectCache(cacheKey, apiCall, ttl) {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    
    const data = await apiCall();
    dataCache.set(cacheKey, data, ttl);
    return data;
  }

  /**
   * Clear related cache entries
   * @param {string|Array} keys - Cache key(s) to clear
   */
  static clearCache(keys) {
    if (Array.isArray(keys)) {
      keys.forEach(key => dataCache.clear(key));
    } else {
      dataCache.clear(keys);
    }
  }

  /**
   * Standardized cache clearing patterns for common operations
   */
  static clearPatterns = {
    // Clear all budget-related data
    budgetOperation: () => {
      CacheService.clearCache([
        CACHE_KEYS.BUDGETS,
        CACHE_KEYS.BUDGET_PROGRESS,
        CACHE_KEYS.BUDGET_SUMMARY
      ]);
    },

    // Clear transaction-related data (affects budgets and AI)
    transactionOperation: () => {
      CacheService.clearCache([
        CACHE_KEYS.TRANSACTIONS,
        CACHE_KEYS.BUDGET_PROGRESS,
        CACHE_KEYS.BUDGET_SUMMARY,
        CACHE_KEYS.AI_INSIGHTS
      ]);
    },

    // Clear category-related data
    categoryOperation: () => {
      CacheService.clearCache([CACHE_KEYS.CATEGORIES]);
    },

    // Clear account-related data
    accountOperation: () => {
      CacheService.clearCache([CACHE_KEYS.ACCOUNTS]);
    },

    // Clear specific budget by ID
    specificBudget: (id) => {
      CacheService.clearCache([
        CACHE_KEYS.BUDGETS,
        CACHE_KEYS.BUDGET_PROGRESS,
        CACHE_KEYS.BUDGET_SUMMARY,
        CACHE_KEYS.BUDGET_BY_ID(id)
      ]);
    }
  };
}

/**
 * Convenience methods for common caching patterns
 */

// Main entities (use service methods for consistency)
export const getCachedCategories = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.CATEGORIES, apiCall, CACHE_TTL.CATEGORIES, CACHE_STRATEGIES.SERVICE_METHOD);

export const getCachedAccounts = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.ACCOUNTS, apiCall, CACHE_TTL.ACCOUNTS, CACHE_STRATEGIES.SERVICE_METHOD);

export const getCachedTransactions = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.TRANSACTIONS, apiCall, CACHE_TTL.TRANSACTIONS, CACHE_STRATEGIES.SERVICE_METHOD);

// Computed data (use direct cache)
export const getCachedBudgets = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.BUDGETS, apiCall, CACHE_TTL.BUDGETS);

export const getCachedBudgetProgress = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.BUDGET_PROGRESS, apiCall, CACHE_TTL.BUDGET_PROGRESS);

export const getCachedBudgetSummary = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.BUDGET_SUMMARY, apiCall, CACHE_TTL.BUDGET_SUMMARY);

export const getCachedBudgetById = (id, apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.BUDGET_BY_ID(id), apiCall, CACHE_TTL.ACCOUNTS);

// AI data
export const getCachedAIInsights = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.AI_INSIGHTS, apiCall, CACHE_TTL.AI_INSIGHTS, CACHE_STRATEGIES.SERVICE_METHOD);

export const getCachedAISuggestions = (apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.AI_SUGGESTED_CATEGORIES, apiCall, CACHE_TTL.SUGGESTED_CATEGORIES, CACHE_STRATEGIES.SERVICE_METHOD);

export const getCachedAICategorySuggestion = (description, type, apiCall) => 
  CacheService.getCachedData(CACHE_KEYS.AI_CATEGORY_SUGGESTION(description, type), apiCall, CACHE_TTL.AI_CATEGORIES);