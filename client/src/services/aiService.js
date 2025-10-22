// src/services/aiService.js
import API from '../api.js';
import { dataCache } from '../utils/dataCache.js';
import { CACHE_TTL } from '../constants/timeConstants';

// Suggest category for a transaction
export const suggestCategory = async (description, type) => {
  try {
    // Basic validation
    if (!description?.trim()) {
      return {
        suggestedCategory: null,
        confidence: "low",
        reason: "Description is required",
        fallback: true
      };
    }

    // Create cache key based on description and type
    const cacheKey = `ai_category_${description.toLowerCase().trim()}_${type || 'expense'}`;
    
    // Check cache using dataCache directly
    const cached = dataCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API call
    const requestData = {
      description: description.trim(),
      type: (type || 'expense').toLowerCase()
    };
    
    const response = await API.post('/ai/suggest-category', requestData);
    
    // Basic response validation
    if (!response?.data) {
      throw new Error('Empty response from server');
    }
    
    // Cache the result using dataCache directly
    const cacheTime = response.data.fallback ? CACHE_TTL.AI_FALLBACK : CACHE_TTL.AI_CATEGORIES;
    dataCache.set(cacheKey, response.data, cacheTime);
    
    return response.data;
    
  } catch (error) {
    console.error('AI category suggestion error:', error);
    
    // Return graceful fallback for any error
    return {
      suggestedCategory: null,
      confidence: "low",
      reason: "AI service temporarily unavailable",
      fallback: true,
      error: error.message
    };
  }
};

// Get suggested categories for user to add
export const getSuggestedCategories = async () => {
  try {
    const response = await API.get('/ai/suggest-categories');
    return response?.data || [];
  } catch (error) {
    console.error('AI category suggestions error:', error);
    return [];
  }
};

// Get spending insights
export const getSpendingInsights = async (url = '/ai/insights') => {
  try {
    const response = await API.get(url);
    if (!response || !response.data) {
      throw new Error('Invalid response from AI service');
    }
    return response.data;
  } catch (error) {
    console.error('AI insights error:', error);
    throw error.response?.data || { message: 'Failed to get spending insights' };
  }
};