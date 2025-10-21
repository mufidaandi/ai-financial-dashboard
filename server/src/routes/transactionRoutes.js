// routes/transactionRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction 
} from "../controllers/transactionController.js";

const router = express.Router();

// @route   POST /api/transactions
// @desc    Add new transaction
// @access  Private
router.post("/", protect, createTransaction);

// @route   GET /api/transactions
// @desc    Get all user transactions
// @access  Private  
router.get("/", protect, getTransactions);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put("/:id", protect, updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete("/:id", protect, deleteTransaction);

export default router;
