import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import Account from "../models/Account.js";
import { 
  getOrCreateDefaultCategory, 
  applyTransactionToBalances, 
  reverseTransactionFromBalances,
  validateTransactionFields,
  processTransactionBalances,
  TRANSACTION_TYPES
} from "../utils/transactionUtils.js";

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const { amount, category, account, fromAccount, toAccount, date, description, type } = req.body;
    
    // Validate transaction fields using utility function
    const validation = validateTransactionFields(type, { account, fromAccount, toAccount });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    
    if (type === 'transfer') {
      // For transfers, create two separate transactions
      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const transferCategory = await getOrCreateDefaultCategory(req.user._id, 'Transfer');
      
      // Fetch account names for proper descriptions
      const fromAccountData = await Account.findById(fromAccount);
      const toAccountData = await Account.findById(toAccount);
      
      if (!fromAccountData || !toAccountData) {
        return res.status(400).json({ message: "One or both accounts not found" });
      }
      
      // Create debit transaction (money leaving fromAccount)
      const debitTransaction = await Transaction.create({
        user: req.user._id,
        amount: -Math.abs(amount), // Negative amount for debit
        category: transferCategory,
        account: fromAccount,
        date,
        description: `Transfer to ${toAccountData.name}`,
        type: 'transfer', // Use transfer type instead of expense
        transferId,
        fromAccount: fromAccount,
        toAccount: toAccount
      });
      
      // Create credit transaction (money entering toAccount)  
      const creditTransaction = await Transaction.create({
        user: req.user._id,
        amount: Math.abs(amount), // Positive amount for credit
        category: transferCategory,
        account: toAccount,
        date,
        description: `Transfer from ${fromAccountData.name}`,
        type: 'transfer', // Use transfer type instead of income
        transferId,
        fromAccount: fromAccount,
        toAccount: toAccount
      });
      
      // Update account balances for transfer using the transfer transaction object
      const transferBalanceData = {
        type: TRANSACTION_TYPES.TRANSFER,
        fromAccount,
        toAccount,
        amount: Math.abs(amount)
      };
      await processTransactionBalances(transferBalanceData, 'create');
      
      // Return both transactions
      res.status(201).json({
        message: "Transfer transactions created successfully",
        transactions: [debitTransaction, creditTransaction],
        transferId
      });
      
    } else {
      // For income and expense, create single transaction
      let finalCategory = category;
      if (type === 'income') {
        finalCategory = await getOrCreateDefaultCategory(req.user._id, 'Income');
      }
      // For expense, use provided category or leave undefined
      
      const transaction = await Transaction.create({
        user: req.user._id,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount), // Negative for expenses, positive for income
        category: finalCategory,
        account,
        date,
        description,
        type,
        isTransfer: false
      });

      // Update account balances based on transaction
      await processTransactionBalances(transaction, 'create');

      res.status(201).json(transaction);
    }
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ message: "Error creating transaction", error: err.message });
  }
};

// Get all transactions for logged in user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('account', 'name type')
      .populate('fromAccount', 'name type')
      .populate('toAccount', 'name type')
      .populate('category', 'name')
      .sort({ date: -1 });
    
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
    await processTransactionBalances(existingTransaction, 'delete');
    
    // If type is being updated, validate field combinations
    if (type) {
      const validation = validateTransactionFields(type, { account, fromAccount, toAccount });
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
      }
    }
    
    // Prepare update data with proper field exclusions
    let updateData = { date, description };
    
    if (type === 'income' || type === 'expense') {
      updateData.type = type;
      updateData.account = account;
      updateData.fromAccount = undefined;
      updateData.toAccount = undefined;
      
      // Amount should already have correct sign from frontend
      updateData.amount = amount;
      
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
      updateData.amount = amount; // Amount should already have correct sign
      // Always force Transfer category for transfer transactions
      updateData.category = await getOrCreateDefaultCategory(req.user._id, 'Transfer');
    } else {
      // If type is not being changed, preserve existing structure
      if (account !== undefined) updateData.account = account;
      if (category !== undefined) updateData.category = category;
      if (fromAccount !== undefined) updateData.fromAccount = fromAccount;
      if (toAccount !== undefined) updateData.toAccount = toAccount;
      
      // If amount is being updated, use it directly (should already have correct sign)
      if (amount !== undefined) {
        updateData.amount = amount;
      }
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
    await processTransactionBalances(transaction, 'create');
    
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
    await processTransactionBalances(transaction, 'delete');
    
    await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting transaction", error: err.message });
  }
};
