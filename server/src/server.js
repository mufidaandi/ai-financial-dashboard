import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import { 
  generalLimiter, 
  authLimiter, 
  apiLimiter, 
  strictLimiter 
} from "./middleware/rateLimitMiddleware.js";


dotenv.config();

const app = express();

// Trust proxy - CRITICAL for deployment on Vercel/other cloud platforms
// This allows Express to correctly read X-Forwarded-For headers
app.set('trust proxy', true);

// Initialize database connection without await at top level
connectDB().catch(err => {
  console.error('Database connection failed:', err.message);
});

// Configure CORS with specific options from environment variables
const allowedOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint (before rate limiting)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Routes

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/transactions", apiLimiter, transactionRoutes);
app.use("/api/categories", apiLimiter, categoryRoutes);
app.use("/api/accounts", apiLimiter, accountRoutes);
app.use("/api/ai", strictLimiter, aiRoutes);
app.use("/api/budgets", apiLimiter, budgetRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});


app.get("/", (req, res) => {
  res.send("Server is working!");
});

const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
export default (req, res) => app(req, res);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
