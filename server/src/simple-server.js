import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Initialize database connection (non-blocking)
connectDB().catch(err => {
  console.error('Database connection failed:', err.message);
});

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-financial-dashboard.vercel.app'
];

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

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Simple test route
app.get("/", (req, res) => {
  res.json({ message: "Express server is working!" });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: "2.0"  // Adding version to check if deployment updated
  });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const isConnected = mongoose.default.connection.readyState === 1;
    res.json({ 
      success: true, 
      database: isConnected ? 'Connected' : 'Not Connected',
      mongoUri: process.env.MONGO_URI ? 'Set' : 'Not Set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      mongoUri: process.env.MONGO_URI ? 'Set' : 'Not Set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set'
    });
  }
});

// Simple auth test endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    
    // Import User model dynamically
    const { default: User } = await import('./models/User.js');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Import bcrypt dynamically
    const bcrypt = await import('bcryptjs');
    
    // Compare password
    const isMatch = await bcrypt.default.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Import jwt dynamically
    const jwt = await import('jsonwebtoken');
    
    // Create JWT
    const token = jwt.default.sign({ id: user._id }, process.env.JWT_SECRET, {
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
});

// Basic error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log('Catch-all route hit:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
export default app;