// src/utils/transactionUtils.js
import Account from "../models/Account.js";
import Category from "../models/Category.js";

/**
 * Transaction utility functions to centralize balance management and reduce duplication
 */

// Constants for account types that support balance tracking
export const BALANCE_TRACKING_ACCOUNT_TYPES = ["Savings", "Checking"];

// Constants for transaction types
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense", 
  TRANSFER: "transfer"
};

/**
 * Helper function to get or create default categories
 * @param {string} userId - User ID
 * @param {string} categoryName - Category name to get or create
 * @returns {Promise<string>} - Category ID
 */
export const getOrCreateDefaultCategory = async (userId, categoryName) => {
  let category = await Category.findOne({ user: userId, name: categoryName });
  if (!category) {
    category = await Category.create({ user: userId, name: categoryName });
  }
  return category._id;
};

/**
 * Helper function to update account balance (only for Savings and Checking accounts)
 * @param {string} accountId - Account ID to update
 * @param {number} amount - Amount to add/subtract from balance
 */
export const updateAccountBalance = async (accountId, amount) => {
  if (!accountId) return;
  
  const account = await Account.findById(accountId);
  if (!account || !BALANCE_TRACKING_ACCOUNT_TYPES.includes(account.type)) {
    return; // Only update balances for accounts that support balance tracking
  }
  
  await Account.findByIdAndUpdate(accountId, {
    $inc: { balance: amount }
  });
};

/**
 * Apply transaction effects to account balances
 * @param {Object} transaction - Transaction object with type, account, fromAccount, toAccount, amount
 */
export const applyTransactionToBalances = async (transaction) => {
  const { type, account, fromAccount, toAccount, amount } = transaction;
  
  switch (type) {
    case TRANSACTION_TYPES.INCOME:
    case TRANSACTION_TYPES.EXPENSE:
      // For income/expense, amount is already correctly signed (positive/negative)
      await updateAccountBalance(account, amount);
      break;
      
    case TRANSACTION_TYPES.TRANSFER:
      // For transfers: subtract from source, add to destination
      await updateAccountBalance(fromAccount, -Math.abs(amount));
      await updateAccountBalance(toAccount, Math.abs(amount));
      break;
      
    default:
      console.warn(`Unknown transaction type: ${type}`);
  }
};

/**
 * Reverse transaction effects from account balances
 * @param {Object} transaction - Transaction object with type, account, fromAccount, toAccount, amount
 */
export const reverseTransactionFromBalances = async (transaction) => {
  const { type, account, fromAccount, toAccount, amount } = transaction;
  
  switch (type) {
    case TRANSACTION_TYPES.INCOME:
    case TRANSACTION_TYPES.EXPENSE:
      // Reverse by negating the amount (works for both positive income and negative expense)
      await updateAccountBalance(account, -amount);
      break;
      
    case TRANSACTION_TYPES.TRANSFER:
      // Reverse transfer: add back to source, subtract from destination
      await updateAccountBalance(fromAccount, Math.abs(amount));
      await updateAccountBalance(toAccount, -Math.abs(amount));
      break;
      
    default:
      console.warn(`Unknown transaction type for reversal: ${type}`);
  }
};

/**
 * Validate transaction type and required fields
 * @param {string} type - Transaction type
 * @param {Object} fields - Object with account, fromAccount, toAccount fields
 * @returns {Object} - Validation result with isValid and message
 */
export const validateTransactionFields = (type, fields) => {
  const { account, fromAccount, toAccount } = fields;
  
  if (!type || !Object.values(TRANSACTION_TYPES).includes(type)) {
    return {
      isValid: false,
      message: "Transaction type is required and must be 'income', 'expense', or 'transfer'"
    };
  }
  
  switch (type) {
    case TRANSACTION_TYPES.INCOME:
    case TRANSACTION_TYPES.EXPENSE:
      if (!account) {
        return {
          isValid: false,
          message: `${type} transactions require an account`
        };
      }
      if ((fromAccount && fromAccount.trim()) || (toAccount && toAccount.trim())) {
        return {
          isValid: false,
          message: `${type} transactions cannot have fromAccount or toAccount fields`
        };
      }
      break;
      
    case TRANSACTION_TYPES.TRANSFER:
      if (!fromAccount || !toAccount) {
        return {
          isValid: false,
          message: `${type} transactions require both fromAccount and toAccount`
        };
      }
      if (fromAccount === toAccount) {
        return {
          isValid: false,
          message: `${type} transactions cannot have the same fromAccount and toAccount`
        };
      }
      break;
  }
  
  return { isValid: true };
};

/**
 * Complete transaction processing workflow
 * @param {Object} transaction - Transaction object
 * @param {string} operation - Operation type: 'create', 'update', 'delete'
 * @param {Object} existingTransaction - Existing transaction for updates/deletes
 */
export const processTransactionBalances = async (transaction, operation, existingTransaction = null) => {
  switch (operation) {
    case 'create':
      await applyTransactionToBalances(transaction);
      break;
      
    case 'update':
      if (existingTransaction) {
        await reverseTransactionFromBalances(existingTransaction);
      }
      await applyTransactionToBalances(transaction);
      break;
      
    case 'delete':
      await reverseTransactionFromBalances(transaction);
      break;
      
    default:
      throw new Error(`Unknown transaction operation: ${operation}`);
  }
};