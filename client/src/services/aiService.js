import api from '../api.js';
import { CacheService, getCachedAISuggestions, getCachedAIInsights } from './cacheService';
import { CACHE_TTL } from '../constants/timeConstants';

// Suggest category for a transaction
export const suggestCategory = async (description, type) => {
  try {
    // Create cache key based on description and type
    const cacheKey = `ai_category_${description.toLowerCase().trim()}_${type}`;
    
    const cached = CacheService.get(cacheKey);
    if (cached) return cached;

    const response = await api.post('/ai/suggest-category', {
      description,
      type
    });
    
    // Cache category suggestions for 24 hours (they're unlikely to change)
    // But cache fallback responses for shorter time (1 hour) in case AI comes back online
    const cacheTime = response.data.fallback ? CACHE_TTL.AI_FALLBACK : CACHE_TTL.AI_CATEGORIES; // 1 hour vs 24 hours
    CacheService.set(cacheKey, response.data, cacheTime);
    
    return response.data;
  } catch (error) {
    console.error('AI category suggestion error:', error);
    
    // If we get a server error, return a graceful fallback
    if (error.response?.status >= 500) {
      return {
        suggestedCategory: null,
        confidence: "low",
        reason: "AI service temporarily unavailable",
        fallback: true
      };
    }
    
    throw error.response?.data || { message: 'Failed to get AI suggestion' };
  }
};

// Get suggested categories for user to add
export const getSuggestedCategories = async () => {
  try {
    return await getCachedAISuggestions(async () => {
      const response = await api.get('/ai/suggest-categories');
      return response.data;
    });
  } catch (error) {
    console.error('AI category suggestions error:', error);
    throw error.response?.data || { message: 'Failed to get category suggestions' };
  }
};

// Get spending insights
export const getSpendingInsights = async (url = '/ai/insights') => {
  try {
    return await getCachedAIInsights(async () => {
      const response = await api.get(url);
      return response.data;
    });
  } catch (error) {
    console.error('AI insights error:', error);
    throw error.response?.data || { message: 'Failed to get spending insights' };
  }
};