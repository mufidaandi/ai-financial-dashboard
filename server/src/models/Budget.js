import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0.01, 'Budget amount must be greater than 0']
  },
  period: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
    default: "monthly"
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Optional fields for more detailed budgeting
  description: {
    type: String,
    trim: true
  },
  // Alert thresholds (as percentages)
  warningThreshold: {
    type: Number,
    default: 80, // Alert when 80% of budget is spent
    min: 0,
    max: 100
  },
  alertThreshold: {
    type: Number,
    default: 100, // Alert when 100% of budget is spent
    min: 0,
    max: 200
  }
}, { 
  timestamps: true 
});

// Create compound unique index for name + user + period (users can't have duplicate budget names for the same period)
budgetSchema.index({ name: 1, user: 1, period: 1 }, { unique: true });

// Index for efficient querying by user and date range
budgetSchema.index({ user: 1, startDate: 1, endDate: 1 });

// Virtual field to calculate current period dates for monthly/yearly budgets
budgetSchema.virtual('currentPeriodStart').get(function() {
  const now = new Date();
  if (this.period === 'monthly') {
    // Create date in UTC to match transaction dates
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  } else if (this.period === 'yearly') {
    return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  }
  return this.startDate;
});

budgetSchema.virtual('currentPeriodEnd').get(function() {
  const now = new Date();
  if (this.period === 'monthly') {
    // Create date in UTC to match transaction dates
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  } else if (this.period === 'yearly') {
    return new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
  }
  return this.endDate;
});

// Method to check if budget is currently active
budgetSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  const currentStart = this.currentPeriodStart;
  const currentEnd = this.currentPeriodEnd;
  
  return now >= currentStart && now <= currentEnd;
};

// Method to get the next period start date
budgetSchema.methods.getNextPeriodStart = function() {
  const now = new Date();
  if (this.period === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (this.period === 'yearly') {
    return new Date(now.getFullYear() + 1, 0, 1);
  }
  return null;
};

export default mongoose.model("Budget", budgetSchema);