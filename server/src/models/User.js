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
      enum: ["US", "CA", "GB", "EU", "JP", "AU", "IN", "CN", "BR", "MX"]
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "CAD", "GBP", "EUR", "JPY", "AUD", "INR", "CNY", "BRL", "MXN"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
