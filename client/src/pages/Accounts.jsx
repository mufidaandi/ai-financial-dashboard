
import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, CreditCard } from "lucide-react";
import accountService from "../services/accountService";
import categoryService from "../services/categoryService";
import transactionService from "../services/transactionService";
import { Modal } from "../components/ui/modal";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import PayCardModal from "../components/PayCardModal";
import { useToast } from "../context/ToastContext";

const ACCOUNT_TYPES = ["Savings", "Checking", "Credit Card", "Cash", "Investment"];

// Utility functions for credit card date calculations
const getNextDate = (dayOfMonth) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  // Create date for this month
  let targetDate = new Date(currentYear, currentMonth, dayOfMonth);
  
  // If the target day has already passed this month, move to next month
  if (dayOfMonth < currentDay) {
    targetDate = new Date(currentYear, currentMonth + 1, dayOfMonth);
  }
  
  // Handle month-end edge cases (e.g., if dayOfMonth is 31 but next month only has 30 days)
  if (targetDate.getDate() !== dayOfMonth) {
    // This happens when the target day doesn't exist in the target month
    // Set to the last day of that month instead
    targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  }
  
  return targetDate;
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getDaysUntil = (date) => {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

function Accounts() {
  const { success, error } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ 
    type: "Savings", 
    name: "",
    balance: "",
    creditLimit: "",
    statementDate: "",
    dueDate: ""
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");
  const [payCardModal, setPayCardModal] = useState({ isOpen: false, creditCard: null });

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
    fetchTransactions();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await accountService.getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setAccounts([]);
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCategories([]);
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setTransactions([]);
      console.error("Error fetching transactions:", err);
    }
  };

  // Calculate credit card balance based on transactions
  const calculateCreditCardBalance = (accountId) => {
    const accountTransactions = transactions.filter(transaction => {
      // Handle regular transactions
      const regularAccountId = typeof transaction.account === 'string' 
        ? transaction.account 
        : transaction.account?._id;
      
      // Handle payments (toAccount for credit cards)
      const toAccountId = typeof transaction.toAccount === 'string'
        ? transaction.toAccount
        : transaction.toAccount?._id;
      
      return regularAccountId === accountId || toAccountId === accountId;
    });
    
    return accountTransactions.reduce((balance, transaction) => {
      if (transaction.type === 'payment') {
        const toAccountId = typeof transaction.toAccount === 'string'
          ? transaction.toAccount
          : transaction.toAccount?._id;
        
        if (toAccountId === accountId) {
          // Payment to this credit card reduces the balance (what you owe)
          // Use raw amount (should be positive for payments)
          return balance - transaction.amount;
        }
      } else {
        // Check if this is a payment transaction based on category (legacy support)
        const isPayment = transaction.category && 
          categories.find(cat => 
            cat._id === transaction.category && 
            (cat.name.toLowerCase().includes('payment') || cat.name.toLowerCase().includes('transfer'))
          );
        
        if (isPayment) {
          // Payments reduce the credit card balance (what you owe)
          // Use raw amount (should be positive for payments)
          return balance - transaction.amount;
        } else if (transaction.type === 'expense') {
          // Regular expenses increase the credit card balance (what you owe)
          // Since expenses are stored as negative values, subtracting them adds to what you owe
          return balance - transaction.amount;
        } else {
          // Other income types (rare for credit cards, but handle them)
          // Use raw amount
          return balance - transaction.amount;
        }
      }
      
      return balance;
    }, 0);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type) {
      error("Please fill in all required fields");
      return;
    }

    // Validate type-specific fields
    if ((form.type === "Savings" || form.type === "Checking") && 
        (!form.balance || form.balance === "")) {
      error("Balance is required for Savings and Checking accounts");
      return;
    }
    
    // Additional validation for balance
    if ((form.type === "Savings" || form.type === "Checking") && 
        (isNaN(parseFloat(form.balance)) || parseFloat(form.balance) < 0)) {
      if (isNaN(parseFloat(form.balance))) {
        error("Balance must be a valid number");
        return;
      }
    }

    // Validate Credit Card specific fields
    if (form.type === "Credit Card") {
      if (!form.creditLimit || !form.statementDate || !form.dueDate) {
        error("Credit limit, statement date, and due date are required for Credit Card accounts");
        return;
      }
      
      // Validate credit limit
      if (isNaN(parseFloat(form.creditLimit)) || parseFloat(form.creditLimit) <= 0) {
        error("Credit limit must be a valid number greater than 0");
        return;
      }
      
      // Validate statement date
      if (parseInt(form.statementDate) < 1 || parseInt(form.statementDate) > 31) {
        error("Statement date must be between 1 and 31");
        return;
      }
      
      // Validate due date
      if (parseInt(form.dueDate) < 1 || parseInt(form.dueDate) > 31) {
        error("Due date must be between 1 and 31");
        return;
      }
    }

    try {
      const accountData = {
        name: form.name,
        type: form.type
      };

      // Add conditional fields
      if (form.type === "Savings" || form.type === "Checking") {
        accountData.balance = parseFloat(form.balance);
      }

      if (form.type === "Credit Card") {
        accountData.creditLimit = parseFloat(form.creditLimit);
        accountData.statementDate = parseInt(form.statementDate);
        accountData.dueDate = parseInt(form.dueDate);
      }

      await accountService.addAccount(accountData);
      success(`${accountData.name} account added successfully!`);
      setForm({ 
        type: "Savings", 
        name: "",
        balance: "",
        creditLimit: "",
        statementDate: "",
        dueDate: ""
      });
      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      console.error("Error adding account:", err);
      error(err.response?.data?.message || "Error adding account");
    }
  };

  const handleEdit = (acc) => {
    setEditId(acc._id);
    setEditForm({ 
      type: acc.type, 
      name: acc.name,
      // Don't include balance for Savings/Checking since it's auto-managed
      balance: (acc.type === "Savings" || acc.type === "Checking") ? "" : (acc.balance || ""),
      creditLimit: acc.creditLimit || "",
      statementDate: acc.statementDate || "",
      dueDate: acc.dueDate || ""
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (editForm.type === "Credit Card") {
      if (!editForm.creditLimit || !editForm.statementDate || !editForm.dueDate) {
        error("Credit limit, statement date, and due date are required for Credit Card accounts");
        return;
      }
    }

    try {
      const accountData = {
        name: editForm.name,
        type: editForm.type
      };

      // Only include balance for non-Savings/Checking accounts
      if (editForm.type !== "Savings" && editForm.type !== "Checking") {
        if (editForm.balance !== undefined && editForm.balance !== "") {
          accountData.balance = parseFloat(editForm.balance);
        }
      }
      // For Savings/Checking, don't send balance - it's managed by transactions

      if (editForm.type === "Credit Card") {
        accountData.creditLimit = parseFloat(editForm.creditLimit);
        accountData.statementDate = parseInt(editForm.statementDate);
        accountData.dueDate = parseInt(editForm.dueDate);
      }

      await accountService.updateAccount(editId, accountData);
      success(`${accountData.name} account updated successfully!`);
      setEditId(null);
      setEditForm({});
      fetchAccounts();
    } catch (err) {
      console.error("Error updating account:", err);
      error(err.response?.data?.message || "Error updating account");
    }
  };

  const handleDelete = async (id) => {
    try {
      await accountService.deleteAccount(id);
      success(`Account deleted successfully!`);
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
      fetchAccounts();
    } catch (err) {
      console.error("Error deleting account:", err);
      error("Error deleting account");
    }
  };

  const handlePayCard = (creditCard) => {
    setPayCardModal({ isOpen: true, creditCard });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!transferForm.fromAccount || !transferForm.toAccount || !transferForm.amount || !transferForm.date) {
      error("Please fill in all fields");
      return;
    }
    
    if (transferForm.fromAccount === transferForm.toAccount) {
      error("From Account and To Account cannot be the same");
      return;
    }
    
    if (parseFloat(transferForm.amount) <= 0) {
      error("Amount must be greater than 0");
      return;
    }

    try {
      const fromAccount = accounts.find(acc => acc._id === transferForm.fromAccount);
      const toAccount = accounts.find(acc => acc._id === transferForm.toAccount);
      
      // Create single transfer transaction
      const transferData = {
        description: `Transfer from ${fromAccount?.name} to ${toAccount?.name}`,
        category: null,
        fromAccount: transferForm.fromAccount,
        toAccount: transferForm.toAccount,
        amount: parseFloat(transferForm.amount),
        date: transferForm.date,
        type: 'transfer'
      };
      
      // Add the transfer transaction
      await transactionService.addTransaction(transferData);
      
      success(`Transfer of $${transferForm.amount} from ${fromAccount?.name} to ${toAccount?.name} completed successfully!`);
      
      // Reset form and close modal
      setTransferForm({
        fromAccount: "",
        toAccount: "",
        amount: "",
        date: new Date().toISOString().split('T')[0]
      });
      setShowTransferModal(false);
      
      // Refresh both transactions and accounts to update balances
      await fetchTransactions();
      await fetchAccounts();
    } catch (err) {
      console.error("Error processing transfer:", err);
      error("Error processing transfer");
    }
  };

  const handlePayment = async (paymentData) => {
    try {
      // Find the credit card name for the description
      const creditCard = accounts.find(acc => acc._id === paymentData.toAccount);
      const fromAccount = accounts.find(acc => acc._id === paymentData.fromAccount);
      
      // Find a suitable category for credit card payments - prioritize "Payments" category
      let paymentCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('payment')
      );
      
      // If no "Payments" category found, try "Transfer"
      if (!paymentCategory) {
        paymentCategory = categories.find(cat => 
          cat.name.toLowerCase().includes('transfer')
        );
      }
      
      // If still no suitable category found, create "Payments" category
      if (!paymentCategory) {
        try {
          const newCategory = await categoryService.addCategory("Payments");
          paymentCategory = newCategory;
          // Refresh categories list
          await fetchCategories();
        } catch (err) {
          console.error("Error creating Payments category:", err);
          // Fallback to first available category or null
          paymentCategory = categories.length > 0 ? categories[0] : null;
        }
      }

      // Create single payment transaction
      const paymentTransactionData = {
        description: `Payment from ${fromAccount?.name} to ${creditCard?.name}`,
        category: paymentCategory?._id || null,
        fromAccount: paymentData.fromAccount,
        toAccount: paymentData.toAccount,
        account: paymentData.toAccount, 
        amount: parseFloat(paymentData.amount),
        date: paymentData.date,
        type: 'transfer'
      };

      // Add the payment transaction
      await transactionService.addTransaction(paymentTransactionData);
      
      success(`Payment of $${paymentData.amount} from ${fromAccount?.name} to ${creditCard?.name} has been recorded successfully!`);
      
      // Refresh both transactions and accounts to update all account balances
      await fetchTransactions();
      await fetchAccounts();
      
      // Close the modal
      setPayCardModal({ isOpen: false, creditCard: null });
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error; // Re-throw to let the modal handle it
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">Accounts</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowTransferModal(true)} variant="outline" className="dark:border-gray-700">
            Transfer
          </Button>
          <Button onClick={() => setShowModal(true)} className="dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 dark:focus:ring-blue-400" data-tour="add-account">
            Add Account
          </Button>
        </div>
      </div>
      {/* Modal */}
      <Modal open={showModal} onClose={() => {
        setShowModal(false);
        setForm({ 
          type: "Savings", 
          name: "",
          balance: "",
          creditLimit: "",
          statementDate: "",
          dueDate: ""
        });
      }}>
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Add Account</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
              Account Type <span className="text-red-500">*</span>
            </label>
            <Select name="type" value={form.type} onChange={handleChange} required>
              {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
              Account Name <span className="text-red-500">*</span>
            </label>
            <Input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Account name" required />
          </div>

          {/* Conditional fields for Savings/Checking */}
          {(form.type === "Savings" || form.type === "Checking") && (
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                Initial Balance <span className="text-red-500">*</span>
              </label>
              <Input 
                name="balance" 
                type="number" 
                step="0.01"
                value={form.balance} 
                onChange={handleChange} 
                placeholder="0.00" 
                required 
              />
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      💡 How Account Balance Works
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Enter your current account balance as of today. Going forward, your balance will be automatically updated when you add income, expenses, or transfers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional fields for Credit Card */}
          {form.type === "Credit Card" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                  Credit Limit <span className="text-red-500">*</span>
                </label>
                <Input 
                  name="creditLimit" 
                  type="number" 
                  step="0.01"
                  value={form.creditLimit} 
                  onChange={handleChange} 
                  placeholder="5000.00" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                  Statement Date <span className="text-red-500">*</span>
                </label>
                <Select name="statementDate" value={form.statementDate} onChange={handleChange} required>
                  <option value="">Select day of month</option>
                  {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <Select name="dueDate" value={form.dueDate} onChange={handleChange} required>
                  <option value="">Select day of month</option>
                  {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </Select>
              </div>
            </>
          )}

          <Button type="submit">Add Account</Button>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal open={showTransferModal} onClose={() => {
        setShowTransferModal(false);
        setTransferForm({
          fromAccount: "",
          toAccount: "",
          amount: "",
          date: new Date().toISOString().split('T')[0]
        });
      }}>
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Transfer Money</h2>
        <form onSubmit={handleTransfer} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
              From Account <span className="text-red-500">*</span>
            </label>
            <Select 
              name="fromAccount" 
              value={transferForm.fromAccount} 
              onChange={(e) => setTransferForm({...transferForm, fromAccount: e.target.value})} 
              required
            >
              <option value="">Select source account</option>
              {accounts.filter(acc => acc.type === "Savings" || acc.type === "Checking").map(acc => (
                <option key={acc._id} value={acc._id}>{acc.name} ({acc.type})</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
              To Account <span className="text-red-500">*</span>
            </label>
            <Select 
              name="toAccount" 
              value={transferForm.toAccount} 
              onChange={(e) => setTransferForm({...transferForm, toAccount: e.target.value})} 
              required
            >
              <option value="">Select destination account</option>
              {accounts.filter(acc => acc.type === "Savings" || acc.type === "Checking").map(acc => (
                <option key={acc._id} value={acc._id}>{acc.name} ({acc.type})</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input 
              name="amount" 
              type="number" 
              step="0.01"
              value={transferForm.amount} 
              onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})} 
              placeholder="0.00" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
              Date <span className="text-red-500">*</span>
            </label>
            <Input 
              name="date" 
              type="date" 
              value={transferForm.date} 
              onChange={(e) => setTransferForm({...transferForm, date: e.target.value})} 
              required 
            />
          </div>

          <Button type="submit">Transfer Money</Button>
        </form>
      </Modal>
      
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">No accounts added yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {accounts.map(acc => (
              <div key={acc._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start relative">
                {editId === acc._id ? (
                  <>
                    <div className="w-full mb-2">
                      <label className="block text-sm font-medium mb-1 dark:text-gray-100">Type</label>
                      <Select name="type" value={editForm.type} onChange={handleEditChange} required className="w-full">
                        {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </Select>
                    </div>
                    
                    <div className="w-full mb-2">
                      <label className="block text-sm font-medium mb-1 dark:text-gray-100">Name</label>
                      <Input name="name" type="text" value={editForm.name} onChange={handleEditChange} className="w-full" required />
                    </div>

                    {/* Display current balance for Savings/Checking (read-only) */}
                    {(editForm.type === "Savings" || editForm.type === "Checking") && (
                      <div className="w-full mb-2">
                        <label className="block text-sm font-medium mb-1 dark:text-gray-100">Current Balance</label>
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                          <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                            ${(acc.balance || 0).toFixed(2)}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Balance is automatically updated by transactions
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Conditional edit fields for Credit Card */}
                    {editForm.type === "Credit Card" && (
                      <>
                        <div className="w-full mb-2">
                          <label className="block text-sm font-medium mb-1 dark:text-gray-100">Credit Limit</label>
                          <Input 
                            name="creditLimit" 
                            type="number" 
                            step="0.01"
                            value={editForm.creditLimit} 
                            onChange={handleEditChange} 
                            className="w-full" 
                            required 
                          />
                        </div>
                        
                        <div className="w-full mb-2">
                          <label className="block text-sm font-medium mb-1 dark:text-gray-100">Statement Date</label>
                          <Select name="statementDate" value={editForm.statementDate} onChange={handleEditChange} required className="w-full">
                            <option value="">Select day</option>
                            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </Select>
                        </div>
                        
                        <div className="w-full mb-2">
                          <label className="block text-sm font-medium mb-1 dark:text-gray-100">Due Date</label>
                          <Select name="dueDate" value={editForm.dueDate} onChange={handleEditChange} required className="w-full">
                            <option value="">Select day</option>
                            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 mt-2">
                      <Button onClick={handleUpdate} variant="secondary" className="p-1" title="Save">
                        <Check size={15} />
                      </Button>
                      <Button onClick={() => setEditId(null)} variant="outline" className="p-1" title="Cancel">
                        <X size={15} />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{acc.type}</span>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{acc.name}</h2>
                    
                    {/* Display balance for Savings/Checking */}
                    {(acc.type === "Savings" || acc.type === "Checking") && (
                      <div className="w-full mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Current Balance</span>
                        <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                          ${(acc.balance || 0).toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Display credit card information */}
                    {acc.type === "Credit Card" && (
                      <div className="w-full mb-2 space-y-2">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Current Balance</span>
                          <p className="text-md font-semibold text-red-600 dark:text-red-400">
                            ${calculateCreditCardBalance(acc._id).toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Statement Date */}
                        {acc.statementDate && (
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Next Statement</span>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium dark:text-gray-100">
                                {formatDate(getNextDate(acc.statementDate))}
                              </p>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {(() => {
                                  const days = getDaysUntil(getNextDate(acc.statementDate));
                                  return days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Due Date */}
                        {acc.dueDate && (
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Next Due Date</span>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium dark:text-gray-100">
                                {formatDate(getNextDate(acc.dueDate))}
                              </p>
                              <span className={`text-xs ${(() => {
                                const days = getDaysUntil(getNextDate(acc.dueDate));
                                if (days <= 3) return 'text-red-500 font-medium';
                                if (days <= 7) return 'text-yellow-500 font-medium';
                                return 'text-gray-400 dark:text-gray-500';
                              })()}`}>
                                {(() => {
                                  const days = getDaysUntil(getNextDate(acc.dueDate));
                                  if (days === 0) return 'Due Today!';
                                  if (days === 1) return 'Due Tomorrow!';
                                  if (days < 0) return 'Overdue!';
                                  return `${days} days`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto w-full justify-end">
                      {acc.type === "Credit Card" && (
                        <Button 
                          onClick={() => handlePayCard(acc)} 
                          variant="ghost" 
                          className="border-none p-1 text-green-700 dark:text-green-400" 
                          title="Pay Card"
                        >
                          <CreditCard size={18} />
                        </Button>
                      )}
                      <Button onClick={() => handleEdit(acc)} variant="ghost" className="border-none p-1 text-blue-600 dark:text-blue-300" title="Edit">
                        <Pencil size={18} />
                      </Button>
                      <Button onClick={() => { setConfirmDeleteId(acc._id); setConfirmDeleteName(acc.name); }} variant="ghost" className="border-none p-1 text-red-600 dark:text-red-400" title="Delete">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {/* Delete Confirmation Modal */}
      <Modal open={confirmDeleteId} onClose={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }}>
        <h2 className="text-xl font-bold mb-4">Delete Account</h2>
        <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{confirmDeleteName}</span>?</p>
        <div className="flex gap-4 justify-end">
          <Button onClick={() => handleDelete(confirmDeleteId)} variant="destructive">Delete</Button>
          <Button onClick={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }} variant="outline">Cancel</Button>
        </div>
      </Modal>

      {/* Pay Card Modal */}
      <PayCardModal
        isOpen={payCardModal.isOpen}
        onClose={() => setPayCardModal({ isOpen: false, creditCard: null })}
        creditCard={payCardModal.creditCard}
        accounts={accounts}
        onPayment={handlePayment}
      />
    </div>
  );
}

export default Accounts;
