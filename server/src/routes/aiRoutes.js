import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { suggestCategory, testGemini, suggestCategories, getSpendingInsights } from '../controllers/aiController.js';

const router = express.Router();

// AI-powered transaction categorization
router.post('/suggest-category', protect, suggestCategory);

// AI-powered category suggestions
router.get('/suggest-categories', protect, suggestCategories);

// AI-powered spending insights
router.get('/insights', protect, getSpendingInsights);

// Test endpoint for Gemini API
router.get('/test', testGemini);

export default router;
