// src/services/transactionService.js
import API from "../api.js";

// Get all transactions
const getTransactions = async () => {
  const res = await API.get("/transactions");
  return res.data;
};

// Add new transaction
const addTransaction = async (data) => {
  console.log("Adding transaction with data:", data);
  const res = await API.post("/transactions", data);
  return res.data;
};

// Update transaction
const updateTransaction = async (id, data) => {
  const res = await API.put(`/transactions/${id}`, data);
  return res.data;
};

// Delete transaction
const deleteTransaction = async (id) => {
  const res = await API.delete(`/transactions/${id}`);
  return res.data;
};

export default { getTransactions, addTransaction, updateTransaction, deleteTransaction };
