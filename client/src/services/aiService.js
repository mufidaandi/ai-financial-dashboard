// src/services/aiService.js
import API from '../api.js';
import { dataCache } from '../utils/dataCache.js';
import { CACHE_TTL } from '../constants/timeConstants';

// Suggest category for a transaction
export const suggestCategory = async (description, type) => {
  try {
    console.log('=== AI SUGGESTION DEBUG START ===');
    console.log('Starting AI suggestion with:', { description, type });
    
    // Basic validation
    if (!description?.trim()) {
      console.error('Description is empty');
      return {
        suggestedCategory: null,
        confidence: "low",
        reason: "Description is required",
        fallback: true
      };
    }

    // Create cache key based on description and type
    const cacheKey = `ai_category_${description.toLowerCase().trim()}_${type || 'expense'}`;
    
    console.log('Checking cache with key:', cacheKey);
    
    // Check cache using dataCache directly
    const cached = dataCache.get(cacheKey);
    if (cached) {
      console.log('Returning cached result:', cached);
      return cached;
    }

    console.log('Making API call to:', '/ai/suggest-category');
    console.log('Request payload:', {
      description: description.trim(),
      type: (type || 'expense').toLowerCase()
    });
    
    // Use a more direct approach
    const requestData = {
      description: description.trim(),
      type: (type || 'expense').toLowerCase()
    };
    
    console.log('About to make API.post call...');
    const response = await API.post('/ai/suggest-category', requestData);
    console.log('API response received:', response);
    
    // Basic response validation
    if (!response?.data) {
      console.error('Empty response data');
      throw new Error('Empty response from server');
    }
    
    // Cache the result using dataCache directly
    const cacheTime = response.data.fallback ? CACHE_TTL.AI_FALLBACK : CACHE_TTL.AI_CATEGORIES;
    dataCache.set(cacheKey, response.data, cacheTime);
    
    console.log('=== AI SUGGESTION DEBUG END ===');
    return response.data;
    
  } catch (error) {
    console.error('=== AI SUGGESTION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Full error:', error);
    console.error('=== END AI SUGGESTION ERROR ===');
    
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