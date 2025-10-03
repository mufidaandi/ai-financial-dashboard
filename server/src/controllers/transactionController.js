import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import Account from "../models/Account.js";

// Helper function to get or create default categories
const getOrCreateDefaultCategory = async (userId, categoryName) => {
  let category = await Category.findOne({ user: userId, name: categoryName });
  if (!category) {
    category = await Category.create({ user: userId, name: categoryName });
  }
  return category._id;
};

// Helper function to update account balance
const updateAccountBalance = async (accountId, amount, operation) => {
  if (!accountId) return;
  
  const account = await Account.findById(accountId);
  if (!account || (account.type !== "Savings" && account.type !== "Checking")) {
    return; // Only update balances for Savings and Checking accounts
  }
  
  let balanceChange = 0;
  if (operation === 'add') {
    balanceChange = amount;
  } else if (operation === 'subtract') {
    balanceChange = -amount;
  }
  
  await Account.findByIdAndUpdate(accountId, {
    $inc: { balance: balanceChange }
  });
};

// Helper function to apply transaction to account balances
const applyTransactionToBalances = async (transaction) => {
  const { type, account, fromAccount, toAccount, amount } = transaction;
  
  if (type === 'income') {
    // Add income to the account
    await updateAccountBalance(account, amount, 'add');
  } else if (type === 'expense') {
    // Subtract expense from the account
    await updateAccountBalance(account, amount, 'subtract');
  } else if (type === 'transfer') {
    // Subtract from source account, add to destination account
    await updateAccountBalance(fromAccount, amount, 'subtract');
    await updateAccountBalance(toAccount, amount, 'add');
  }
};

// Helper function to reverse transaction from account balances
const reverseTransactionFromBalances = async (transaction) => {
  const { type, account, fromAccount, toAccount, amount } = transaction;
  
  if (type === 'income') {
    // Reverse income: subtract from the account
    await updateAccountBalance(account, amount, 'subtract');
  } else if (type === 'expense') {
    // Reverse expense: add back to the account
    await updateAccountBalance(account, amount, 'add');
  } else if (type === 'transfer') {
    // Reverse transfer: add back to source, subtract from destination
    await updateAccountBalance(fromAccount, amount, 'add');
    await updateAccountBalance(toAccount, amount, 'subtract');
  }
};

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
  const { amount, category, account, fromAccount, toAccount, date, description, type } = req.body;
    
    // Basic type validation
    if (!type || !["income", "expense", "transfer"].includes(type)) {
      return res.status(400).json({ message: "Transaction type is required and must be 'income', 'expense', or 'transfer'" });
    }
    
    // Comprehensive field validation based on transaction type
    if (type === 'income' || type === 'expense') {
      // Income/Expense validation
      if (!account) {
        return res.status(400).json({ message: `${type} transactions require an account` });
      }
      if ((fromAccount && fromAccount.trim()) || (toAccount && toAccount.trim())) {
        return res.status(400).json({ message: `${type} transactions cannot have fromAccount or toAccount fields` });
      }
      // Category is optional for income/expense
    } else if (type === 'transfer') {
      // Transfer validation
      if (!fromAccount || !toAccount) {
        return res.status(400).json({ message: `${type} transactions require both fromAccount and toAccount` });
      }
      if (fromAccount === toAccount) {
        return res.status(400).json({ message: `${type} transactions cannot have the same fromAccount and toAccount` });
      }
      // Account field will be set to toAccount for transfers
    }
    
    // Set categories for income and transfer automatically, ignore user input
    let finalCategory = category;
    if (type === 'income') {
      finalCategory = await getOrCreateDefaultCategory(req.user._id, 'Income');
    } else if (type === 'transfer') {
      finalCategory = await getOrCreateDefaultCategory(req.user._id, 'Transfer');
    }
    // For expense, use provided category or leave undefined
    
    const transaction = await Transaction.create({
      user: req.user._id, // comes from auth middleware
      amount,
      category: finalCategory, // Always use default for income/transfer
      account: (type === 'transfer') ? toAccount : account, // Set account to toAccount for transfers
      fromAccount: (type === 'income' || type === 'expense') ? undefined : fromAccount,
      toAccount: (type === 'income' || type === 'expense') ? undefined : toAccount,
      date,
      description,
      type
    });

    // Update account balances based on transaction
    await applyTransactionToBalances(transaction);

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error creating transaction", error: err.message });
  }
};

// Get all transactions for logged in user
export const getTransactions = async (req, res) => {
  try {
    console.log("Fetching transactions for user:", req.user._id);
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('account', 'name type')
      .populate('fromAccount', 'name type')
      .populate('toAccount', 'name type')
      .populate('category', 'name')
      .sort({ date: -1 });
    
    console.log("Found", transactions.length, "transactions");
    console.log("Sample transaction populate result:", transactions[0]);
    
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Error fetching transactions", error: err.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { amount, category, account, fromAccount, toAccount, date, description, type } = req.body;
    
    // Basic type validation
    if (type && !["income", "expense", "transfer"].includes(type)) {
      return res.status(400).json({ message: "Transaction type must be 'income', 'expense', or 'transfer'" });
    }

    // Get the existing transaction to reverse its balance effects
    const existingTransaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!existingTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Reverse the old transaction's balance effects
    await reverseTransactionFromBalances(existingTransaction);
    
    // If type is being updated, validate field combinations
    if (type) {
      if (type === 'income' || type === 'expense') {
        // Income/Expense validation
        if (!account) {
          return res.status(400).json({ message: `${type} transactions require an account` });
        }
        if ((fromAccount && fromAccount.trim()) || (toAccount && toAccount.trim())) {
          return res.status(400).json({ message: `${type} transactions cannot have fromAccount or toAccount fields` });
        }
      } else if (type === 'transfer') {
        // Transfer validation
        if (!fromAccount || !toAccount) {
          return res.status(400).json({ message: `${type} transactions require both fromAccount and toAccount` });
        }
        if (fromAccount === toAccount) {
          return res.status(400).json({ message: `${type} transactions cannot have the same fromAccount and toAccount` });
        }
        // Account field will be set to toAccount for transfers
      }
    }
    
    // Prepare update data with proper field exclusions
    let updateData = { amount, date, description };
    
    if (type === 'income' || type === 'expense') {
      updateData.type = type;
      updateData.account = account;
      updateData.fromAccount = undefined;
      updateData.toAccount = undefined;
      
      // Handle categories based on type
      if (type === 'income') {
        // Always force Income category for income transactions
        updateData.category = await getOrCreateDefaultCategory(req.user._id, 'Income');
      } else {
        // For expense, use provided category
        updateData.category = category;
      }
    } else if (type === 'transfer') {
      updateData.type = type;
      updateData.fromAccount = fromAccount;
      updateData.toAccount = toAccount;
      updateData.account = toAccount; // Set account to toAccount for transfers
      // Always force Transfer category for transfer transactions
      updateData.category = await getOrCreateDefaultCategory(req.user._id, 'Transfer');
    } else {
      // If type is not being changed, preserve existing structure
      if (account !== undefined) updateData.account = account;
      if (category !== undefined) updateData.category = category;
      if (fromAccount !== undefined) updateData.fromAccount = fromAccount;
      if (toAccount !== undefined) updateData.toAccount = toAccount;
    }
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    )
    .populate('account', 'name type')
    .populate('fromAccount', 'name type')
    .populate('toAccount', 'name type')
    .populate('category', 'name');
    
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    
    // Apply the updated transaction's balance effects
    await applyTransactionToBalances(transaction);
    
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error updating transaction", error: err.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    
    // Reverse the transaction's balance effects before deleting
    await reverseTransactionFromBalances(transaction);
    
    await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting transaction", error: err.message });
  }
};
