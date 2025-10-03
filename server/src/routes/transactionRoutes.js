// routes/transactionRoutes.js
import express from "express";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/transactions
// @desc    Add new transaction
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { type, amount, category, description, account, date } = req.body;

    // Build transaction object with required fields
    const transactionData = {
      user: req.user._id,
      description,
      amount,
      date,
      type
    };

    // Only add optional fields if they exist and are not empty
    if (category && category.trim() !== "") {
      transactionData.category = category;
    }
    if (account && account.trim() !== "") {
      transactionData.account = account;
    }

    const transaction = new Transaction(transactionData);

    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (err) {
    res.status(500).json({ message: "Server error adding transaction", error: err.message });
  }
});

// @route   GET /api/transactions
// @desc    Get all user transactions
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching transactions" });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Ensure user owns the transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ message: "Server error updating transaction" });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting transaction" });
  }
});

export default router;
