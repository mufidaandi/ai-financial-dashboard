import Transaction from "../models/Transaction.js";

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    const transaction = await Transaction.create({
      userId: req.user.id, // comes from auth middleware
      amount,
      category,
      date,
      description
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error creating transaction", error: err.message });
  }
};

// Get all transactions for logged in user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions", error: err.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error updating transaction", error: err.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting transaction", error: err.message });
  }
};
