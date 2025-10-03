import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Database connection with proper error handling for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Don't throw error in serverless environment
  }
};

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
    version: "4.0",
    database: isConnected ? "Connected" : "Not Connected"
  });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    await connectDB();
    res.json({ 
      success: true, 
      database: isConnected ? 'Connected' : 'Not Connected',
      readyState: mongoose.connection.readyState,
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

// Registration endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }
    
    // Ensure database is connected
    await connectDB();
    
    // Import User model and bcrypt
    const { default: User } = await import('./models/User.js');
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
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
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: "Server error creating user",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Test basic auth endpoint without database
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    
    // Ensure database is connected
    await connectDB();
    
    // Import User model and bcrypt
    const { default: User } = await import('./models/User.js');
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Compare password
    const isMatch = await bcrypt.default.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
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

// Export for Vercel
export default app;