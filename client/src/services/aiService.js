import API from '../api.js';
import { CacheService, getCachedAISuggestions, getCachedAIInsights } from './cacheService';
import { CACHE_TTL } from '../constants/timeConstants';

// Suggest category for a transaction
export const suggestCategory = async (description, type) => {
  try {
    // Validate inputs
    if (!description || typeof description !== 'string') {
      throw new Error('Description is required and must be a string');
    }
    
    if (!type || typeof type !== 'string') {
      throw new Error('Type is required and must be a string');
    }

    // Create cache key based on description and type
    const cacheKey = `ai_category_${description.toLowerCase().trim()}_${type}`;
    
    const cached = CacheService.get(cacheKey);
    if (cached) return cached;

    // Ensure API is available
    if (!API || typeof API.post !== 'function') {
      console.error('API object is not properly initialized');
      throw new Error('API service unavailable');
    }

    const response = await API.post('/ai/suggest-category', {
      description: description.trim(),
      type: type.toLowerCase()
    });
    
    // Validate response
    if (!response || !response.data) {
      throw new Error('Invalid response from AI service');
    }
    
    // Cache category suggestions for 24 hours (they're unlikely to change)
    // But cache fallback responses for shorter time (1 hour) in case AI comes back online
    const cacheTime = response.data.fallback ? CACHE_TTL.AI_FALLBACK : CACHE_TTL.AI_CATEGORIES; // 1 hour vs 24 hours
    CacheService.set(cacheKey, response.data, cacheTime);
    
    return response.data;
  } catch (error) {
    console.error('AI category suggestion error:', error);
    
    // Enhanced error handling for different scenarios
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return {
        suggestedCategory: null,
        confidence: "low",
        reason: "Network connection issue",
        fallback: true
      };
    }
    
    // If we get a server error, return a graceful fallback
    if (error.response?.status >= 500 || error.response?.status === 401) {
      return {
        suggestedCategory: null,
        confidence: "low",
        reason: "AI service temporarily unavailable",
        fallback: true
      };
    }
    
    // For other errors, return fallback but log the specific error
    return {
      suggestedCategory: null,
      confidence: "low",
      reason: "AI suggestion failed",
      fallback: true,
      error: error.message
    };
  }
};

// Get suggested categories for user to add
export const getSuggestedCategories = async () => {
  try {
    return await getCachedAISuggestions(async () => {
      // Ensure API is available
      if (!API || typeof API.get !== 'function') {
        console.error('API object is not properly initialized');
        throw new Error('API service unavailable');
      }
      
      const response = await API.get('/ai/suggest-categories');
      
      if (!response || !response.data) {
        throw new Error('Invalid response from AI service');
      }
      
      return response.data;
    });
  } catch (error) {
    console.error('AI category suggestions error:', error);
    // Return empty array as fallback instead of throwing
    return [];
  }
};

// Get spending insights
export const getSpendingInsights = async (url = '/ai/insights') => {
  try {
    return await getCachedAIInsights(async () => {
      // Ensure API is available
      if (!API || typeof API.get !== 'function') {
        console.error('API object is not properly initialized');
        throw new Error('API service unavailable');
      }
      
      const response = await API.get(url);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from AI service');
      }
      
      return response.data;
    });
  } catch (error) {
    console.error('AI insights error:', error);
    throw error.response?.data || { message: 'Failed to get spending insights' };
  }
};