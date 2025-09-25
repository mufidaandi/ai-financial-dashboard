// src/services/transactionService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/transactions";

// Get all transactions
const getTransactions = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Add new transaction
const addTransaction = async (transactionData) => {
  const res = await axios.post(API_URL, transactionData);
  return res.data;
};

// Delete transaction
const deleteTransaction = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

export default { getTransactions, addTransaction, deleteTransaction };
