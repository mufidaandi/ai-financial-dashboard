// routes/authRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
  forgotPassword,
  getOnboardingState,
  updateOnboardingState,
  completeTour,
  resetOnboarding
} from "../controllers/authController.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Login user and return token
router.post("/login", loginUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put("/profile", protect, updateProfile);

// @route   PUT /api/auth/password
// @desc    Change user password
router.put("/password", protect, changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Reset password directly (no email)
router.post("/forgot-password", forgotPassword);

// @route   GET /api/auth/onboarding
// @desc    Get user's onboarding state
router.get("/onboarding", protect, getOnboardingState);

// @route   PUT /api/auth/onboarding
// @desc    Update user's onboarding state
router.put("/onboarding", protect, updateOnboardingState);

// @route   POST /api/auth/onboarding/complete-tour
// @desc    Mark a specific tour as completed
router.post("/onboarding/complete-tour", protect, completeTour);

// @route   POST /api/auth/onboarding/reset
// @desc    Reset user's onboarding state
router.post("/onboarding/reset", protect, resetOnboarding);

export default router;
