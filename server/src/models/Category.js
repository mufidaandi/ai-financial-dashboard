import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Create compound unique index for name + user (allows same category name for different users)
categorySchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
