import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "US",
      enum: ["US", "CA", "GB", "EU", "JP", "AU", "IN", "CN", "BR", "MX", "PH"]
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "CAD", "GBP", "EUR", "JPY", "AUD", "INR", "CNY", "BRL", "MXN", "PHP"]
    },
    onboarding: {
      hasSeenOnboarding: {
        type: Boolean,
        default: false
      },
      completedTours: {
        type: [String],
        default: []
      },
      hasCompletedInitialSetup: {
        type: Boolean,
        default: false
      },
      hasAddedTransaction: {
        type: Boolean,
        default: false
      },
      hasCreatedBudget: {
        type: Boolean,
        default: false
      },
      onboardingVersion: {
        type: String,
        default: "1.0"
      },
      lastOnboardingUpdate: {
        type: Date,
        default: Date.now
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
