// src/services/transactionService.js
import API from "../api.js";
import { CacheService, getCachedTransactions } from "./cacheService";

// Get all transactions
const getTransactions = async () => {
  return await getCachedTransactions(async () => {
    const res = await API.get("/transactions");
    return res.data;
  });
};

// Add new transaction
const addTransaction = async (data) => {
  const res = await API.post("/transactions", data);
  CacheService.clearPatterns.transactionOperation();
  return res.data;
};

// Update transaction
const updateTransaction = async (id, data) => {
  const res = await API.put(`/transactions/${id}`, data);
  CacheService.clearPatterns.transactionOperation();
  return res.data;
};

// Delete transaction
const deleteTransaction = async (id) => {
  const res = await API.delete(`/transactions/${id}`);
  CacheService.clearPatterns.transactionOperation();
  return res.data;
};

export default { getTransactions, addTransaction, updateTransaction, deleteTransaction };
