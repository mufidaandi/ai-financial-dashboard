// src/utils/cacheUtils.js
import { dataCache } from './dataCache';

/**
 * Centralized cache management utilities to eliminate duplication
 * across service files and ensure consistent cache invalidation patterns
 */

// Clear transaction-related cache (affects budgets and AI insights)
export const clearTransactionRelatedCache = () => {
  dataCache.clear('transactions');
  dataCache.clear('budgetProgress');
  dataCache.clear('budgetSummary');
  dataCache.clearAICache(); // Clear AI insights since they depend on transaction data
};

// Clear budget-related cache
export const clearBudgetRelatedCache = (budgetId = null) => {
  dataCache.clear('budgets');
  dataCache.clear('budgetProgress');
  dataCache.clear('budgetSummary');
  if (budgetId) {
    dataCache.clear(`budget_${budgetId}`);
  }
};

// Clear category-related cache
export const clearCategoryRelatedCache = () => {
  dataCache.clear('categories');
};

// Clear account-related cache
export const clearAccountRelatedCache = () => {
  dataCache.clear('accounts');
};

// Clear all data-related caches (useful for logout or data refresh)
export const clearAllDataCache = () => {
  clearTransactionRelatedCache();
  clearBudgetRelatedCache();
  clearCategoryRelatedCache();
  clearAccountRelatedCache();
};

// Clear multiple cache keys at once
export const clearMultipleCaches = (cacheKeys) => {
  cacheKeys.forEach(key => dataCache.clear(key));
};