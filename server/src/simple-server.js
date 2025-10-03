import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

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
    version: "3.0"
  });
});

// Test basic auth endpoint without database
app.post("/api/auth/login", (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  
  // Hard-coded test for now
  if (email === "admin@test.com" && password === "admin") {
    res.json({
      token: "test-token-123",
      user: { 
        id: "test-id", 
        name: "Admin User", 
        email: "admin@test.com"
      }
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// Basic error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// Export for Vercel
export default app;