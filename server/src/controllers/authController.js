import User from "../models/User.js";
import bcrypt from "bcryptjs"; // Changed to bcryptjs to match routes
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with onboarding state
    const newUser = new User({ 
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
    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      token,
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email,
        country: newUser.country,
        currency: newUser.currency 
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error registering user" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
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
};

export const updateProfile = async (req, res) => {
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
};

export const changePassword = async (req, res) => {
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
};

export const refreshToken = async (req, res) => {
  try {
    // User is already verified by the auth middleware
    const userId = req.user._id;

    // Generate new token with extended expiration
    const newToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token: newToken,
      message: "Token refreshed successfully"
    });
  } catch (err) {
    console.error("Error refreshing token:", err);
    res.status(500).json({ message: "Server error refreshing token" });
  }
};

// Forgot password functionality (direct reset without email)
export const forgotPassword = async (req, res) => {
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
};

// Get user's onboarding state
export const getOnboardingState = async (req, res) => {
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
};

// Update user's onboarding state
export const updateOnboardingState = async (req, res) => {
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
};

// Mark a specific tour as completed
export const completeTour = async (req, res) => {
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
};

// Reset user's onboarding state
export const resetOnboarding = async (req, res) => {
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
};
