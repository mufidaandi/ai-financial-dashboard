import api from '../api.js';

// Suggest category for a transaction
export const suggestCategory = async (description, type) => {
  try {
    const response = await api.post('/ai/suggest-category', {
      description,
      type
    });
    return response.data;
  } catch (error) {
    console.error('AI category suggestion error:', error);
    throw error.response?.data || { message: 'Failed to get AI suggestion' };
  }
};

// Get suggested categories for user to add
export const getSuggestedCategories = async () => {
  try {
    const response = await api.get('/ai/suggest-categories');
    return response.data;
  } catch (error) {
    console.error('AI category suggestions error:', error);
    throw error.response?.data || { message: 'Failed to get category suggestions' };
  }
};

// Get spending insights
export const getSpendingInsights = async (url = '/ai/insights') => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('AI insights error:', error);
    throw error.response?.data || { message: 'Failed to get spending insights' };
  }
};