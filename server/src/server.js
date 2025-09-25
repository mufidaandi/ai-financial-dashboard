import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
import transactionRoutes from "./routes/transactionRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);


app.get("/", (req, res) => {
  res.send("Server is working!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Routes placeholder
// app.get("/", (req, res) => res.send("API is running..."));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
