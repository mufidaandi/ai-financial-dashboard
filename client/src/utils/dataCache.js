// Global data cache to reduce API calls
import { CACHE_TTL } from '../constants/timeConstants.js';

class DataCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = CACHE_TTL.DEFAULT; // 5 minutes
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      // Cache expired
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  clear(key) {
    if (key) {
      this.cache.delete(key);
      this.timestamps.delete(key);
    } else {
      this.cache.clear();
      this.timestamps.clear();
    }
  }

  // Cache categories for 10 minutes (they don't change often)
  async getCategories(apiCall) {
    const cached = this.get('categories');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('categories', data, CACHE_TTL.CATEGORIES); // 10 minutes
    return data;
  }

  // Cache accounts for 5 minutes
  async getAccounts(apiCall) {
    const cached = this.get('accounts');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('accounts', data, CACHE_TTL.ACCOUNTS); // 5 minutes
    return data;
  }

  // Don't cache transactions as they change frequently
  // But cache for 1 minute to handle React double-mounting
  async getTransactions(apiCall) {
    const cached = this.get('transactions');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('transactions', data, CACHE_TTL.TRANSACTIONS); // 1 minute
    return data;
  }
  // Cache budgets for 3 minutes (they change less frequently than transactions)
  async getBudgets(apiCall) {
    const cached = this.get('budgets');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('budgets', data, CACHE_TTL.BUDGETS); // 3 minutes
    return data;
  }

  // Cache budget progress for 2 minutes (includes calculated data)
  async getBudgetProgress(apiCall) {
    const cached = this.get('budgetProgress');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('budgetProgress', data, CACHE_TTL.BUDGET_PROGRESS); // 2 minutes
    return data;
  }

  // Cache budget summary for 2 minutes (dashboard data)
  async getBudgetSummary(apiCall) {
    const cached = this.get('budgetSummary');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('budgetSummary', data, CACHE_TTL.BUDGET_SUMMARY); // 2 minutes
    return data;
  }

  // Cache AI spending insights for 30 minutes (expensive to generate, but should refresh periodically)
  async getSpendingInsights(apiCall) {
    const cached = this.get('ai_insights');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('ai_insights', data, CACHE_TTL.AI_INSIGHTS); // 30 minutes
    return data;
  }

  // Cache AI suggested categories for 4 hours (don't change often)
  async getSuggestedCategories(apiCall) {
    const cached = this.get('ai_suggested_categories');
    if (cached) return cached;
    
    const data = await apiCall();
    this.set('ai_suggested_categories', data, CACHE_TTL.SUGGESTED_CATEGORIES); // 4 hours
    return data;
  }

  // Clear all budget-related cache (useful when transactions change)
  clearBudgetCache() {
    this.clear('budgets');
    this.clear('budgetProgress');
    this.clear('budgetSummary');
  }

  // Clear AI cache when transactions change (since insights depend on transaction data)
  clearAICache() {
    this.clear('ai_insights');
    // Don't clear suggested categories as they're more general
    // Don't clear individual category suggestions as they're based on description patterns
  }

  // Clear all cache (useful for logout or major data changes)
  clearAll() {
    this.cache.clear();
    this.timestamps.clear();
    console.log('🧹 All cache cleared');
  }
}

export const dataCache = new DataCache();