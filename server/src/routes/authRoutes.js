// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      onboarding: {
        hasSeenOnboarding: false,
        completedTours: [],
        hasCompletedInitialSetup: false,
        hasAddedTransaction: false,
        hasCreatedBudget: false,
        onboardingVersion: "1.0",
        lastOnboardingUpdate: new Date()
      }
    });

    await user.save();

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        country: user.country,
        currency: user.currency 
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error registering user" });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        country: user.country,
        currency: user.currency 
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: "Server error logging in user",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, country, currency } = req.body;
    const userId = req.user._id;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update user profile
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (country) updateData.country = country;
    if (currency) updateData.currency = currency;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        country: updatedUser.country,
        currency: updatedUser.currency,
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// @route   PUT /api/auth/password
// @desc    Change user password
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Find user and include password for verification
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error changing password" });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Reset password directly (no email)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with that email address" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Create JWT token for immediate login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ 
      message: "Password reset successfully",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        country: user.country,
        currency: user.currency 
      }
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/onboarding
// @desc    Get user's onboarding state
router.get("/onboarding", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('onboarding');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      onboarding: user.onboarding || {
        hasSeenOnboarding: false,
        completedTours: [],
        hasCompletedInitialSetup: false,
        hasAddedTransaction: false,
        hasCreatedBudget: false,
        onboardingVersion: "1.0"
      }
    });
  } catch (err) {
    console.error("Get onboarding state error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/onboarding
// @desc    Update user's onboarding state
router.put("/onboarding", protect, async (req, res) => {
  try {
    const { 
      hasSeenOnboarding, 
      completedTours, 
      hasCompletedInitialSetup,
      hasAddedTransaction,
      hasCreatedBudget 
    } = req.body;

    const updateData = {
      'onboarding.lastOnboardingUpdate': new Date()
    };

    // Only update fields that are provided
    if (hasSeenOnboarding !== undefined) {
      updateData['onboarding.hasSeenOnboarding'] = hasSeenOnboarding;
    }
    if (completedTours !== undefined) {
      updateData['onboarding.completedTours'] = completedTours;
    }
    if (hasCompletedInitialSetup !== undefined) {
      updateData['onboarding.hasCompletedInitialSetup'] = hasCompletedInitialSetup;
    }
    if (hasAddedTransaction !== undefined) {
      updateData['onboarding.hasAddedTransaction'] = hasAddedTransaction;
    }
    if (hasCreatedBudget !== undefined) {
      updateData['onboarding.hasCreatedBudget'] = hasCreatedBudget;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, upsert: false }
    ).select('onboarding');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Onboarding state updated successfully",
      onboarding: user.onboarding
    });
  } catch (err) {
    console.error("Update onboarding state error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/onboarding/complete-tour
// @desc    Mark a specific tour as completed
router.post("/onboarding/complete-tour", protect, async (req, res) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({ message: "Tour ID is required" });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize onboarding if it doesn't exist
    if (!user.onboarding) {
      user.onboarding = {
        hasSeenOnboarding: false,
        completedTours: [],
        hasCompletedInitialSetup: false,
        hasAddedTransaction: false,
        hasCreatedBudget: false,
        onboardingVersion: "1.0"
      };
    }

    // Add tour to completed tours if not already there
    if (!user.onboarding.completedTours.includes(tourId)) {
      user.onboarding.completedTours.push(tourId);
    }

    user.onboarding.lastOnboardingUpdate = new Date();
    await user.save();

    res.json({
      message: `Tour ${tourId} marked as completed`,
      onboarding: user.onboarding
    });
  } catch (err) {
    console.error("Complete tour error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/onboarding/reset
// @desc    Reset user's onboarding state
router.post("/onboarding/reset", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'onboarding.hasSeenOnboarding': false,
          'onboarding.completedTours': [],
          'onboarding.hasCompletedInitialSetup': false,
          'onboarding.lastOnboardingUpdate': new Date()
        }
      },
      { new: true }
    ).select('onboarding');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Onboarding state reset successfully",
      onboarding: user.onboarding
    });
  } catch (error) {
    console.error("Reset onboarding error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
