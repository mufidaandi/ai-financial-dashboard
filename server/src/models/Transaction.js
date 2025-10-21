// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    // For transfers and payments - source account
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    // For transfers and payments - destination account
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense', 'transfer']
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // For linking transfer transactions
    transferId: {
      type: String,
      required: false,
    },
    // To identify if this is part of a transfer
    isTransfer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
