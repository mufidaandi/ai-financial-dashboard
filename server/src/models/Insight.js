import mongoose from "mongoose";

const insightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  dataHash: {
    type: String,
    required: true,
  },
  transactionCount: {
    type: Number,
    required: true,
  },
  dateRange: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  insights: {
    totalSpent: {
      type: Number,
      required: true,
    },
    averageDaily: {
      type: Number,
      required: true,
    },
    categoryBreakdown: [{
      category: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
      },
      transactionCount: {
        type: Number,
        required: true,
      },
    }],
    trends: {
      spendingTrend: {
        type: String,
        enum: ["increasing", "decreasing", "stable"],
        required: true,
      },
      trendPercentage: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
    aiRecommendations: [{
      type: {
        type: String,
        enum: ["savings", "budgeting", "category", "general"],
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      priority: {
        type: String,
        enum: ["high", "medium", "low"],
        required: true,
      },
    }],
    financialHealthScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    healthFactors: {
      categoryDiversity: {
        type: Number,
        required: true,
      },
      spendingConsistency: {
        type: Number,
        required: true,
      },
      budgetAdherence: {
        type: Number,
        required: true,
      },
    },
  },
}, {
  timestamps: true,
});

// Create compound index for efficient querying
insightSchema.index({ user: 1, generatedAt: -1 });

const Insight = mongoose.model("Insight", insightSchema);

export default Insight;