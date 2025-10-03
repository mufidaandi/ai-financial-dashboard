import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["Savings", "Checking", "Credit Card", "Cash", "Investment"],
    required: true
  },
  // For Savings/Checking accounts
  balance: { 
    type: Number,
    required: function() {
      return this.type === "Savings" || this.type === "Checking";
    }
  },
  // For Credit Card accounts
  creditLimit: { 
    type: Number,
    required: function() {
      return this.type === "Credit Card";
    },
    min: [0.01, 'Credit limit must be greater than 0']
  },
  statementDate: { 
    type: Number,
    required: function() {
      return this.type === "Credit Card";
    },
    min: [1, 'Statement date must be between 1-31'],
    max: [31, 'Statement date must be between 1-31']
  },
  dueDate: { 
    type: Number,
    required: function() {
      return this.type === "Credit Card";
    },
    min: [1, 'Due date must be between 1-31'],
    max: [31, 'Due date must be between 1-31']
  }
}, { timestamps: true });

// Create compound unique index for name + user
accountSchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model("Account", accountSchema);
