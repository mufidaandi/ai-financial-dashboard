import mongoose from "mongoose";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching accounts" });
  }
};

export const addAccount = async (req, res) => {
  try {
    const { name, type, balance, creditLimit, statementDate, dueDate } = req.body;
    
    console.log("Received account data:", { name, type, balance, creditLimit, statementDate, dueDate });
    
    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }
    
    // Check if account name already exists for this user
    const existingAccount = await Account.findOne({ name, user: req.user._id });
    if (existingAccount) {
      return res.status(400).json({ message: "Account name already exists" });
    }
    
    const accountData = { name, type, user: req.user._id };
    
    // Add type-specific fields
    if (type === "Savings" || type === "Checking") {
      if (balance === undefined || balance === null || balance === '') {
        return res.status(400).json({ message: "Balance is required for Savings and Checking accounts" });
      }
      accountData.balance = parseFloat(balance);
    }
    
    if (type === "Credit Card") {
      if (!creditLimit || !statementDate || !dueDate) {
        console.log("Missing credit card fields:", { creditLimit, statementDate, dueDate });
        return res.status(400).json({ message: "Credit limit, statement date, and due date are required for Credit Card accounts" });
      }
      
      const parsedCreditLimit = parseFloat(creditLimit);
      const parsedStatementDate = parseInt(statementDate);
      const parsedDueDate = parseInt(dueDate);
      
      console.log("Parsed credit card values:", { parsedCreditLimit, parsedStatementDate, parsedDueDate });
      
      if (parsedCreditLimit <= 0) {
        return res.status(400).json({ message: "Credit limit must be greater than 0" });
      }
      
      if (parsedStatementDate < 1 || parsedStatementDate > 31) {
        return res.status(400).json({ message: "Statement date must be between 1 and 31" });
      }
      
      if (parsedDueDate < 1 || parsedDueDate > 31) {
        return res.status(400).json({ message: "Due date must be between 1 and 31" });
      }
      
      accountData.creditLimit = parsedCreditLimit;
      accountData.statementDate = parsedStatementDate;
      accountData.dueDate = parsedDueDate;
    }
    
    console.log("Final account data to save:", accountData);
    
    const account = new Account(accountData);
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    console.error("Error in addAccount:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Account name already exists" });
    }
    if (err.name === 'ValidationError') {
      console.log("Validation error details:", err.errors);
      return res.status(400).json({ message: err.message });
    }
    console.error("Error adding account:", err);
    res.status(500).json({ message: "Server error adding account" });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { name, type, balance, creditLimit, statementDate, dueDate } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }
    
    // Check if account name already exists for this user (excluding current account)
    const existingAccount = await Account.findOne({ 
      name, 
      user: req.user._id, 
      _id: { $ne: req.params.id } 
    });
    if (existingAccount) {
      return res.status(400).json({ message: "Account name already exists" });
    }
    
    const updateData = { name, type };
    
    // Clear all optional fields first
    updateData.$unset = {};
    
    // Add type-specific fields
    if (type === "Savings" || type === "Checking") {
      // For Savings/Checking, only update balance if explicitly provided
      // (Balance is now managed by transactions, so we don't require it)
      if (balance !== undefined && balance !== null && balance !== '') {
        updateData.balance = parseFloat(balance);
      }
      // Clear credit card specific fields
      updateData.$unset.creditLimit = "";
      updateData.$unset.statementDate = "";
      updateData.$unset.dueDate = "";
    }
    else if (type === "Credit Card") {
      if (!creditLimit || !statementDate || !dueDate) {
        return res.status(400).json({ message: "Credit limit, statement date, and due date are required for Credit Card accounts" });
      }
      
      const parsedCreditLimit = parseFloat(creditLimit);
      const parsedStatementDate = parseInt(statementDate);
      const parsedDueDate = parseInt(dueDate);
      
      if (parsedCreditLimit <= 0) {
        return res.status(400).json({ message: "Credit limit must be greater than 0" });
      }
      
      if (parsedStatementDate < 1 || parsedStatementDate > 31) {
        return res.status(400).json({ message: "Statement date must be between 1 and 31" });
      }
      
      if (parsedDueDate < 1 || parsedDueDate > 31) {
        return res.status(400).json({ message: "Due date must be between 1 and 31" });
      }
      
      updateData.creditLimit = parsedCreditLimit;
      updateData.statementDate = parsedStatementDate;
      updateData.dueDate = parsedDueDate;
      // Clear balance field
      updateData.$unset.balance = "";
    }
    else {
      // For Cash and Investment accounts, clear all optional fields
      updateData.$unset.balance = "";
      updateData.$unset.creditLimit = "";
      updateData.$unset.statementDate = "";
      updateData.$unset.dueDate = "";
    }
    
    // If no fields to unset, remove the $unset operator
    if (Object.keys(updateData.$unset).length === 0) {
      delete updateData.$unset;
    }
    
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Account name already exists" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error("Error updating account:", err);
    res.status(500).json({ message: "Server error updating account" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting account" });
  }
};

// Fix database indexes - removes any conflicting simple unique index on name field
export const fixAccountIndexes = async (req, res) => {
  try {
    const Account = mongoose.model('Account');
    
    // Get current indexes
    const indexes = await Account.collection.getIndexes();
    console.log("Current indexes:", Object.keys(indexes));
    
    // Check if there's a simple unique index on name field
    const hasSimpleNameIndex = Object.keys(indexes).some(indexName => 
      indexes[indexName].length === 1 && 
      indexes[indexName][0][0] === 'name' &&
      indexName !== '_id_'
    );
    
    if (hasSimpleNameIndex) {
      // Drop the problematic simple name index
      try {
        await Account.collection.dropIndex({ name: 1 });
        console.log("Dropped simple name index");
      } catch (err) {
        console.log("No simple name index to drop or already dropped");
      }
    }
    
    // Ensure the compound index exists
    await Account.collection.createIndex({ name: 1, user: 1 }, { unique: true });
    console.log("Ensured compound index exists");
    
    res.json({ 
      message: "Account indexes fixed successfully",
      currentIndexes: Object.keys(await Account.collection.getIndexes())
    });
  } catch (err) {
    console.error("Error fixing account indexes:", err);
    res.status(500).json({ message: "Server error fixing indexes" });
  }
};

// Recalculate account balances based on existing transactions
export const recalculateBalances = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all Savings and Checking accounts for the user
    const accounts = await Account.find({ 
      user: userId, 
      type: { $in: ["Savings", "Checking"] } 
    });
    
    // Get all transactions for the user
    const transactions = await Transaction.find({ user: userId })
      .sort({ date: 1, createdAt: 1 }); // Sort by date, then creation time
    
    // Reset all account balances to 0 (we'll recalculate from scratch)
    for (const account of accounts) {
      account.balance = 0;
      await account.save();
    }
    
    // Apply each transaction in chronological order
    for (const transaction of transactions) {
      const { type, account: accountId, fromAccount, toAccount, amount } = transaction;
      
      if (type === 'income') {
        // Add income to the account
        const account = accounts.find(acc => acc._id.toString() === accountId.toString());
        if (account) {
          account.balance += amount;
        }
      } else if (type === 'expense') {
        // Subtract expense from the account
        const account = accounts.find(acc => acc._id.toString() === accountId.toString());
        if (account) {
          account.balance -= amount;
        }
      } else if (type === 'transfer') {
        // Subtract from source account, add to destination account
        const fromAcc = accounts.find(acc => acc._id.toString() === fromAccount.toString());
        const toAcc = accounts.find(acc => acc._id.toString() === toAccount.toString());
        
        if (fromAcc) {
          fromAcc.balance -= amount;
        }
        if (toAcc) {
          toAcc.balance += amount;
        }
      }
    }
    
    // Save all updated balances
    const savePromises = accounts.map(account => account.save());
    await Promise.all(savePromises);
    
    res.json({ 
      message: "Account balances recalculated successfully",
      accountsUpdated: accounts.length,
      transactionsProcessed: transactions.length
    });
  } catch (err) {
    console.error("Error recalculating balances:", err);
    res.status(500).json({ message: "Server error recalculating balances" });
  }
};
