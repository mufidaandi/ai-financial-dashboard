import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Sparkles, Filter, CalendarRange, ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import transactionService from "../services/transactionService";
import categoryService from "../services/categoryService";
import accountService from "../services/accountService";
import { suggestCategory } from "../services/aiService";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";
import { useOnboarding } from "../context/OnboardingContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { CustomSelect, CustomSelectItem } from "../components/ui/custom-select";
import { CustomDatePicker } from "../components/ui/CustomDatePicker";
import { Modal } from "../components/ui/modal";
import { DataTable, TableBadge, TableActions } from "../components/ui/table";
import { CategoryPill, TypePill } from "../components/ui/pill";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FORM_MESSAGES } from "../constants/uiConstants";

function Transactions() {
    const { success, error } = useToast();
    const { formatCurrency } = useSettings();
    const { markMilestone } = useOnboarding();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const getToday = () => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    };
    const [form, setForm] = useState({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        account: "",
        fromAccount: "",
        toAccount: "",
        date: getToday()
    });
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteLabel, setConfirmDeleteLabel] = useState("");
    const [aiSuggesting, setAiSuggesting] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    
    // Filter states
    const [filters, setFilters] = useState({
        month: '', // Show all months by default
        category: '',
        type: '',
        account: '',
        amountMin: '',
        amountMax: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Sort states
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchAll();
    }, []);

    // Update pagination when filters or transactions change
    useEffect(() => {
        const filtered = filterTransactions(transactions);
        const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
        setTotalPages(newTotalPages);
        
        // Reset to page 1 if current page is beyond available pages
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [filters, transactions, itemsPerPage, searchTerm, sortConfig]); // Added searchTerm and sortConfig

    // Filter utility functions
    const generateMonthOptions = () => {
        const options = [{ value: '', label: 'All Months' }];
        const currentDate = new Date();
        
        // Generate last 4 months
        for (let i = 3; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            options.push({ value, label });
        }
        
        return options;
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortTransactions = (txList) => {
        if (!sortConfig.key) return txList;

        return [...txList].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle special cases
            if (sortConfig.key === 'category') {
                aValue = a.category?.name || 'N/A';
                bValue = b.category?.name || 'N/A';
            } else if (sortConfig.key === 'account') {
                aValue = a.account?.name || 'Unknown';
                bValue = b.account?.name || 'Unknown';
            } else if (sortConfig.key === 'amount') {
                aValue = parseFloat(a.amount);
                bValue = parseFloat(b.amount);
            } else if (sortConfig.key === 'date') {
                aValue = new Date(a.date);
                bValue = new Date(b.date);
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const filterTransactions = (txList) => {
        return txList.filter(tx => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const categoryName = tx.category?.name || '';
                const accountName = tx.account?.name || '';
                const fromAccountName = tx.fromAccount?.name || '';
                const toAccountName = tx.toAccount?.name || '';
                
                const searchableText = [
                    tx.description,
                    categoryName,
                    accountName,
                    fromAccountName,
                    toAccountName,
                    tx.amount.toString()
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchLower)) {
                    return false;
                }
            }
            
            // Month filter
            if (filters.month) {
                const [year, month] = filters.month.split('-');
                const txDate = new Date(tx.date);
                if (txDate.getFullYear() !== parseInt(year) || txDate.getMonth() !== parseInt(month) - 1) {
                    return false;
                }
            }
            
            // Category filter
            if (filters.category) {
                if (filters.category === 'uncategorized') {
                    if (tx.category) return false;
                } else if (tx.category?._id !== filters.category) {
                    return false;
                }
            }
            
            // Type filter
            if (filters.type && tx.type !== filters.type) {
                return false;
            }
            
            // Account filter
            if (filters.account && tx.account?._id !== filters.account) {
                return false;
            }
            
            // Amount range filter
            if (filters.amountMin && tx.amount < parseFloat(filters.amountMin)) {
                return false;
            }
            if (filters.amountMax && tx.amount > parseFloat(filters.amountMax)) {
                return false;
            }
            
            return true;
        });
    };
    
    const getPaginatedTransactions = (txList) => {
        const filtered = filterTransactions(txList);
        const sorted = sortTransactions(filtered);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sorted.slice(startIndex, endIndex);
    };

    const clearFilters = () => {
        setFilters({
            month: '',
            category: '',
            type: '',
            account: '',
            amountMin: '',
            amountMax: ''
        });
        setSearchTerm('');
        setSortConfig({ key: null, direction: 'asc' });
        setCurrentPage(1);
    };

    const fetchAll = async () => {
        try {
            // Fetch all data first
            const [txs, cats, accs] = await Promise.all([
                transactionService.getTransactions(),
                categoryService.getCategories(), 
                accountService.getAccounts()
            ]);
            
            // Set categories and accounts first
            setCategories(Array.isArray(cats) ? cats : []);
            setAccounts(Array.isArray(accs) ? accs : []);
            
            // Process transactions to ensure proper account/category population
            const processedTxs = Array.isArray(txs) ? txs.map(tx => {
                // If account is just an ID string, find the full account object
                if (typeof tx.account === 'string') {
                    const foundAccount = accs.find(acc => acc._id === tx.account);
                    if (foundAccount) {
                        tx.account = foundAccount;
                    }
                }
                
                // Same for category
                if (typeof tx.category === 'string') {
                    const foundCategory = cats.find(cat => cat._id === tx.category);
                    if (foundCategory) {
                        tx.category = foundCategory;
                    }
                }
                
                // Same for fromAccount and toAccount
                if (typeof tx.fromAccount === 'string') {
                    const foundFromAccount = accs.find(acc => acc._id === tx.fromAccount);
                    if (foundFromAccount) {
                        tx.fromAccount = foundFromAccount;
                    }
                }
                
                if (typeof tx.toAccount === 'string') {
                    const foundToAccount = accs.find(acc => acc._id === tx.toAccount);
                    if (foundToAccount) {
                        tx.toAccount = foundToAccount;
                    }
                }
                
                return tx;
            }) : [];
            
            setTransactions(processedTxs);
            
        } catch (err) {
            console.error("Error fetching data:", err);
            setTransactions([]);
            setCategories([]);
            setAccounts([]);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleTypeChange = (type) => {
        setForm({ 
            ...form, 
            type,
            // Clear category for income/transfer since users can't select them
            category: (type === 'income' || type === 'transfer') ? '' : form.category
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setAiSuggestion(null);
        setForm({ type: "expense", amount: "", category: "", description: "", account: "", fromAccount: "", toAccount: "", date: getToday() });
    };

    const handleAISuggestion = async () => {
        if (!form.description) {
            error("Please enter a description first");
            return;
        }

        setAiSuggesting(true);
        setAiSuggestion(null);

        try {
            const suggestion = await suggestCategory(form.description, form.type);
            setAiSuggestion(suggestion);
            
            // Auto-apply if high confidence and category exists
            if (suggestion.confidence === "high" && suggestion.suggestedCategory) {
                setForm(prevForm => ({ 
                    ...prevForm, 
                    category: suggestion.suggestedCategory._id 
                }));
            }
        } catch (error) {
            console.error("AI suggestion error:", error);
            error("AI suggestion failed. Please try again.");
        } finally {
            setAiSuggesting(false);
        }
    };

    const handleDescriptionBlur = async () => {
        // Auto-trigger AI suggestion when user leaves description field
        if (form.description.trim() && 
            form.type === "expense" && 
            !aiSuggesting && 
            !aiSuggestion && 
            categories.length > 0) {
            
            setAiSuggesting(true);
            setAiSuggestion(null);

            try {
                const suggestion = await suggestCategory(form.description, form.type);
                setAiSuggestion(suggestion);
                
                // Auto-apply if high confidence and category exists
                if (suggestion.confidence === "high" && suggestion.suggestedCategory) {
                    setForm(prevForm => ({ 
                        ...prevForm, 
                        category: suggestion.suggestedCategory._id 
                    }));
                }
            } catch (error) {
                console.error("Auto AI suggestion error:", error);
                // Silently fail for auto-suggestions to not interrupt user flow
            } finally {
                setAiSuggesting(false);
            }
        }
    };

    const applySuggestion = () => {
        if (aiSuggestion?.suggestedCategory) {
            setForm(prevForm => ({ ...prevForm, category: aiSuggestion.suggestedCategory._id }));
            setAiSuggestion(null);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        
        // Validation based on transaction type
        if (!form.type || !form.amount || !form.description || !form.date) {
            error("Please fill in all required fields");
            return;
        }
        
        if (form.type === 'transfer') {
            if (!form.fromAccount || !form.toAccount) {
                error("Please select both from and to accounts for transfers");
                return;
            }
            if (form.fromAccount === form.toAccount) {
                error("From and To accounts cannot be the same");
                return;
            }
        } else {
            if (!form.account) {
                error("Please select an account");
                return;
            }
        }
        
        try {
            // Handle transfers differently - send to backend as transfer type
            if (form.type === 'transfer') {
                const transferData = {
                    type: 'transfer',
                    amount: Number(form.amount),
                    fromAccount: form.fromAccount,
                    toAccount: form.toAccount,
                    date: form.date,
                    description: form.description || 'Transfer'
                };
                
                const result = await transactionService.addTransaction(transferData);
                
                if (result.transactions && result.transactions.length === 2) {
                    success("Transfer completed successfully!");
                } else {
                    success("Transfer completed!");
                }
            } else {
                // Handle regular income/expense transactions
                const payload = {
                    ...form,
                    amount: form.type === 'expense' ? -Math.abs(Number(form.amount)) : Number(form.amount)
                };
                
                // Clean up unused fields for income/expense transactions
                delete payload.fromAccount;
                delete payload.toAccount;
                
                // Remove empty string values
                Object.keys(payload).forEach(key => {
                    if (payload[key] === '') {
                        delete payload[key];
                    }
                });
                
                await transactionService.addTransaction(payload);
                success("Transaction added successfully!");
            }
            
            // Mark milestone: user has added their first transaction
            if (transactions.length === 0) {
                await markMilestone('hasAddedTransaction');
            }
            
            setForm({ type: "expense", amount: "", category: "", description: "", account: "", fromAccount: "", toAccount: "", date: getToday() });
            closeModal();
            fetchAll();
        } catch (err) {
            console.error("Error adding transaction:", err);
            error("Failed to add transaction. Please try again.");
        }
    };

    const handleEdit = (tx) => {
        setEditId(tx._id);
        setEditForm({
            type: tx.type,
            amount: Math.abs(tx.amount), // Always show positive amount in form
            category: tx.category?._id || '',
            description: tx.description,
            account: tx.account?._id || '',
            fromAccount: tx.fromAccount?._id || '',
            toAccount: tx.toAccount?._id || '',
            date: tx.date ? tx.date.slice(0, 10) : getToday()
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditTypeChange = (type) => {
        setEditForm({ 
            ...editForm, 
            type,
            // Clear conflicting fields when changing type
            account: (type === 'transfer') ? '' : editForm.account,
            // Don't clear category for any type since all types can have categories
            fromAccount: (type === 'income' || type === 'expense') ? '' : editForm.fromAccount,
            toAccount: (type === 'income' || type === 'expense') ? '' : editForm.toAccount
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Validation based on transaction type
        if (!editForm.type || !editForm.amount || !editForm.description || !editForm.date) {
            error("Please fill in all required fields");
            return;
        }
        
        if (editForm.type === 'transfer') {
            if (!editForm.fromAccount || !editForm.toAccount) {
                error("Please select both from and to accounts for transfers");
                return;
            }
            if (editForm.fromAccount === editForm.toAccount) {
                error("From and To accounts cannot be the same");
                return;
            }
        } else {
            if (!editForm.account) {
                error("Please select an account");
                return;
            }
        }
        
        try {
            // Note: Transfer editing is complex since they involve two linked transactions
            // For now, we'll prevent editing transfers and suggest deletion + recreation
            if (editForm.type === 'transfer') {
                error("Transfer transactions cannot be edited directly. Please delete and create a new transfer.");
                return;
            }
            
            const payload = {
                ...editForm,
                amount: editForm.type === 'expense' ? -Math.abs(Number(editForm.amount)) : Number(editForm.amount)
            };
            
            // Clean up unused fields for income/expense transactions
            delete payload.fromAccount;
            delete payload.toAccount;
            
            // Remove empty string values
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') {
                    delete payload[key];
                }
            });
            
            await transactionService.updateTransaction(editId, payload);
            success("Transaction updated successfully!");
            setEditId(null);
            setEditForm({});
            fetchAll();
        } catch (err) {
            console.error("Error updating transaction:", err);
            error("Failed to update transaction. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const transactionToDelete = transactions.find(tx => tx._id === id);
            
            // If this is a transfer transaction, we need to delete both linked transactions
            if (transactionToDelete?.type === 'transfer' && transactionToDelete?.transferId) {
                const linkedTransactions = transactions.filter(tx => 
                    tx.transferId === transactionToDelete.transferId
                );
                
                // Delete all linked transfer transactions
                for (const tx of linkedTransactions) {
                    await transactionService.deleteTransaction(tx._id);
                }
                
                success("Transfer deleted successfully!");
            } else {
                // Delete single transaction
                await transactionService.deleteTransaction(id);
                success("Transaction deleted successfully!");
            }
            
            setConfirmDeleteId(null);
            setConfirmDeleteLabel("");
            fetchAll();
        } catch (err) {
            console.error("Error deleting transaction:", err);
            error("Failed to delete transaction. Please try again.");
        }
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-100">Transactions</h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                    {/* Search Field */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search transactions"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full sm:w-64"
                        />
                    </div>
                    
                    <Button 
                        variant="outline" 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Button onClick={() => setShowModal(true)} className="dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 dark:focus:ring-blue-400" data-tour="add-transaction">
                        Add Transaction
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            {showFilters && (
                <Card className="mb-6" data-tour="transaction-filters">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Filter Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-100">Month</label>
                            <CustomSelect
                                value={filters.month}
                                onValueChange={(value) => setFilters({...filters, month: value})}
                                placeholder="All Months"
                            >
                                {generateMonthOptions().map(option => (
                                    <CustomSelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </CustomSelectItem>
                                ))}
                            </CustomSelect>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-100">Category</label>
                            <CustomSelect
                                value={filters.category}
                                onValueChange={(value) => setFilters({...filters, category: value})}
                                placeholder="All Categories"
                            >
                                <CustomSelectItem value="">All Categories</CustomSelectItem>
                                <CustomSelectItem value="uncategorized">Uncategorized</CustomSelectItem>
                                {categories.map(cat => (
                                    <CustomSelectItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </CustomSelectItem>
                                ))}
                            </CustomSelect>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-100">Type</label>
                            <CustomSelect
                                value={filters.type}
                                onValueChange={(value) => setFilters({...filters, type: value})}
                                placeholder="All Types"
                            >
                                <CustomSelectItem value="">All Types</CustomSelectItem>
                                <CustomSelectItem value="income">Income</CustomSelectItem>
                                <CustomSelectItem value="expense">Expense</CustomSelectItem>
                                <CustomSelectItem value="transfer">Transfer</CustomSelectItem>
                            </CustomSelect>
                        </div>

                        {/* Account Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-100">Account</label>
                            <CustomSelect
                                value={filters.account}
                                onValueChange={(value) => setFilters({...filters, account: value})}
                                placeholder="All Accounts"
                            >
                                <CustomSelectItem value="">All Accounts</CustomSelectItem>
                                {accounts.map(acc => (
                                    <CustomSelectItem key={acc._id} value={acc._id}>
                                        {acc.name}
                                    </CustomSelectItem>
                                ))}
                            </CustomSelect>
                        </div>

                        {/* Amount Range */}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-100">Min Amount</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.amountMin}
                                onChange={(e) => setFilters({...filters, amountMin: e.target.value})}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-100">Max Amount</label>
                            <Input
                                type="number"
                                placeholder="∞"
                                value={filters.amountMax}
                                onChange={(e) => setFilters({...filters, amountMax: e.target.value})}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                        
                        {/* Filter Actions */}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                Showing {filterTransactions(transactions).length} of {transactions.length} transactions
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal for Add Transaction */}
            <Modal open={showModal} onClose={closeModal}>
                <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Add Transaction</h2>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <span className="text-red-500 font-semibold" aria-label="Required field indicator">
                            {FORM_MESSAGES.REQUIRED_INDICATOR}
                        </span>
                        {FORM_MESSAGES.REQUIRED_FIELDS_NOTICE}
                    </p>
                </div>
                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                    {/* Tab-style type selector */}
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                            Type <span className="text-red-500" aria-label="Required field">{FORM_MESSAGES.REQUIRED_INDICATOR}</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg font-medium border transition-colors focus:outline-none ${form.type === "income" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"}`}
                                onClick={() => handleTypeChange("income")}
                            >
                                Income
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg font-medium border transition-colors focus:outline-none ${form.type === "expense" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"}`}
                                onClick={() => handleTypeChange("expense")}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg font-medium border transition-colors focus:outline-none ${form.type === "transfer" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"}`}
                                onClick={() => handleTypeChange("transfer")}
                            >
                                Transfer
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                            Date <span className="text-red-500" aria-label="Required field">{FORM_MESSAGES.REQUIRED_INDICATOR}</span>
                        </label>
                        <CustomDatePicker 
                            name="date"
                            value={form.date} 
                            onChange={handleChange}
                            placeholder="Select date"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                            Description <span className="text-red-500" aria-label="Required field">{FORM_MESSAGES.REQUIRED_INDICATOR}</span>
                        </label>
                        <Input name="description" type="text" value={form.description} onChange={handleChange} onBlur={handleDescriptionBlur} placeholder={FORM_MESSAGES.HELP_TEXT.DESCRIPTION} required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                            Amount <span className="text-red-500" aria-label="Required field">{FORM_MESSAGES.REQUIRED_INDICATOR}</span>
                        </label>
                        <Input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="0.00" step="0.01" min="0" required />
                    </div>
                    
                    {form.type === "expense" && (
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                                Category
                            </label>
                            <CustomSelect
                                value={form.category}
                                onValueChange={val => setForm({ ...form, category: val })}
                                placeholder="Select category (optional)"
                            >
                                {categories.map(cat => (
                                    <CustomSelectItem key={cat._id} value={cat._id}>{cat.name}</CustomSelectItem>
                                ))}
                            </CustomSelect>
                            {aiSuggestion && (
                                <Card className="mt-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                        AI Suggestion
                                                    </p>
                                                </div>
                                                {aiSuggestion.suggestedCategory ? (
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        <strong>{aiSuggestion.suggestedCategory.name}</strong>
                                                        <span className="ml-2 text-xs">({aiSuggestion.confidence} confidence)</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        {aiSuggestion.reason}
                                                    </p>
                                                )}
                                                {aiSuggestion.reason && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        {aiSuggestion.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {aiSuggestion.suggestedCategory && aiSuggestion.confidence !== "high" && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={applySuggestion}
                                                    >
                                                        Apply
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setAiSuggestion(null)}
                                                    className="p-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                    
                    {/* Conditional Account Fields */}
                    {form.type === "transfer" ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                                    From Account <span className="text-red-500" aria-label="Required field">{FORM_MESSAGES.REQUIRED_INDICATOR}</span>
                                </label>
                                <CustomSelect
                                    value={form.fromAccount}
                                    onValueChange={val => setForm({ ...form, fromAccount: val })}
                                    placeholder="Select source account"
                                >
                                    {accounts.map(m => (
                                        <CustomSelectItem key={m._id} value={m._id}>{m.name} ({m.type})</CustomSelectItem>
                                    ))}
                                </CustomSelect>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                                    To Account <span className="text-red-500" aria-label="Required field">{FORM_MESSAGES.REQUIRED_INDICATOR}</span>
                                </label>
                                <CustomSelect
                                    value={form.toAccount}
                                    onValueChange={val => setForm({ ...form, toAccount: val })}
                                    placeholder="Select destination account"
                                >
                                    {accounts.map(m => (
                                        <CustomSelectItem key={m._id} value={m._id}>{m.name} ({m.type})</CustomSelectItem>
                                    ))}
                                </CustomSelect>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-100">
                                Account <span className="text-red-500" aria-label="Required field">{FORM_MESSAGES.REQUIRED_INDICATOR}</span>
                            </label>
                            <CustomSelect
                                value={form.account}
                                onValueChange={val => setForm({ ...form, account: val })}
                                placeholder="Select account"
                            >
                                {accounts.map(m => (
                                    <CustomSelectItem key={m._id} value={m._id}>{m.name} ({m.type})</CustomSelectItem>
                                ))}
                            </CustomSelect>
                        </div>
                    )}
                    
                    <Button type="submit" className="mt-2">Add Transaction</Button>
                </form>
            </Modal>
            {accounts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg m-4">No accounts found.</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">You need to create accounts before adding transactions.</p>
                        <Button onClick={() => window.location.href = '/accounts'} className="mb-4">
                            Go to Accounts
                        </Button>
                    </CardContent>
                </Card>
            ) : filterTransactions(transactions).length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">No transactions found.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                <div className="overflow-x-auto" data-tour="transaction-table">
                    <DataTable
                        data={getPaginatedTransactions(transactions)}
                        allowOverflow={editId !== null}
                    columns={[
                        {
                            key: 'date',
                            title: 'Date',
                            sortable: true,
                            render: (value, row) => {
                                if (editId === row._id) {
                                    return <CustomDatePicker 
                                        value={editForm.date?.slice(0, 10)} 
                                        onChange={(e) => setEditForm({...editForm, date: e.target.value})} 
                                        placeholder="Select date"
                                    />;
                                }
                                return value?.slice(0, 10);
                            }
                        },
                        {
                            key: 'category',
                            title: 'Category',
                            sortable: true,
                            render: (value, row) => {
                                if (editId === row._id) {
                                    return (
                                        <div className="flex flex-col gap-2">
                                            {editForm.type === "expense" ? (
                                                <CustomSelect 
                                                    value={editForm.category} 
                                                    onValueChange={(value) => setEditForm({...editForm, category: value})}
                                                    placeholder="Category"
                                                >
                                                    <CustomSelectItem value="">Category</CustomSelectItem>
                                                    {categories.map(cat => (
                                                        <CustomSelectItem key={cat._id} value={cat._id}>{cat.name}</CustomSelectItem>
                                                    ))}
                                                </CustomSelect>
                                            ) : editForm.type === "income" ? (
                                                <TypePill type="income" />
                                            ) : editForm.type === "transfer" ? (
                                                <TypePill type="transfer" />
                                            ) : null}
                                        </div>
                                    );
                                }
                                
                                if (row.category && row.category.name) {
                                    return <CategoryPill category={row.category.name} />;
                                } else if (row.type === "income") {
                                    return <TypePill type="income" />;
                                } else if (row.type === "transfer") {
                                    return <TypePill type="transfer" />;
                                } else {
                                    return <CategoryPill category="Uncategorized" />;
                                }
                            }
                        },
                        {
                            key: 'description',
                            title: 'Description',
                            sortable: true,
                            render: (value, row) => {
                                if (editId === row._id) {
                                    return <Input name="description" type="text" value={editForm.description} onChange={handleEditChange} />;
                                }
                                return value;
                            }
                        },
                        {
                            key: 'amount',
                            title: 'Amount',
                            sortable: true,
                            render: (value, row) => {
                                if (editId === row._id) {
                                    return <Input name="amount" type="number" value={editForm.amount} onChange={handleEditChange} />;
                                }
                                
                                // Determine the sign based on transaction type and transfer direction
                                let displayAmount = Math.abs(value);
                                let colorClass = '';
                                let prefix = '';
                                
                                if (row.type === 'expense') {
                                    prefix = '-';
                                    colorClass = 'text-red-600 dark:text-red-400';
                                } else if (row.type === 'income') {
                                    prefix = '+';
                                    colorClass = 'text-green-700 dark:text-green-400';
                                } else if (row.type === 'transfer') {
                                    // For transfers, show negative for outgoing (from account) and positive for incoming (to account)
                                    if (row.description && row.description.includes('Transfer to')) {
                                        // This is the outgoing transfer (from account)
                                        prefix = '-';
                                        colorClass = 'text-orange-700 dark:text-orange-400';
                                    } else if (row.description && row.description.includes('Transfer from')) {
                                        // This is the incoming transfer (to account)
                                        prefix = '+';
                                        colorClass = 'text-blue-600 dark:text-blue-400';
                                    } else {
                                        // Fallback for transfers without clear direction
                                        prefix = '';
                                        colorClass = 'text-gray-600 dark:text-gray-400';
                                    }
                                }
                                
                                return (
                                    <span className={colorClass}>
                                        {prefix}{formatCurrency(displayAmount)}
                                    </span>
                                );
                            }
                        },
                        {
                            key: 'account',
                            title: 'Account',
                            sortable: true,
                            render: (value, row) => {
                                if (editId === row._id) {
                                    if (editForm.type === "transfer") {
                                        return (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Account: {accounts.find(a => a._id === editForm.toAccount)?.name || 'Select To Account'}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <CustomSelect 
                                                value={editForm.account} 
                                                onValueChange={(value) => setEditForm({...editForm, account: value})}
                                                placeholder="Account"
                                            >
                                                <CustomSelectItem value="">Account</CustomSelectItem>
                                                {accounts.map(m => (
                                                    <CustomSelectItem key={m._id} value={m._id}>{m.name} ({m.type})</CustomSelectItem>
                                                ))}
                                            </CustomSelect>
                                        );
                                    }
                                }
                                
                                if (row.type === 'transfer') {
                                    return row.account?.name || row.toAccount?.name || 'Unknown Account';
                                } else {
                                    return row.account?.name || 'Unknown Account';
                                }
                            }
                        },
                        {
                            key: 'actions',
                            title: 'Actions',
                            align: 'center',
                            render: (value, row) => {
                                if (editId === row._id) {
                                    return (
                                        <TableActions>
                                            <Button onClick={handleUpdate} variant="secondary" className="p-1 mr-1" title="Save">
                                                <Check size={18} />
                                            </Button>
                                            <Button onClick={() => setEditId(null)} variant="outline" className="p-1" title="Cancel">
                                                <X size={18} />
                                            </Button>
                                        </TableActions>
                                    );
                                }
                                
                                return (
                                    <TableActions>
                                        <Button onClick={() => handleEdit(row)} variant="ghost" className="border-none mr-2 p-1 text-blue-600 dark:text-blue-300" title="Edit">
                                            <Pencil size={18} />
                                        </Button>
                                        <Button onClick={() => { setConfirmDeleteId(row._id); setConfirmDeleteLabel(row.description || row.category?.name || row.amount); }} variant="ghost" className="border-none p-1 text-red-600 dark:text-red-400" title="Delete">
                                            <Trash2 size={18} />
                                        </Button>
                                    </TableActions>
                                );
                            }
                        }
                    ]}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filterTransactions(transactions).length,
                        itemsPerPage,
                        onPageChange: setCurrentPage,
                        showInfo: true
                    }}
                    emptyMessage="No transactions found."
                />
                </div>
                </>
            )}
            {/* Delete Confirmation Modal */}
            <Modal open={confirmDeleteId} onClose={() => { setConfirmDeleteId(null); setConfirmDeleteLabel(""); }}>
                <h2 className="text-xl font-bold mb-4">Delete Transaction</h2>
                <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{confirmDeleteLabel}</span>?</p>
                <div className="flex gap-4 justify-end">
                    <Button onClick={() => handleDelete(confirmDeleteId)} variant="destructive">Delete</Button>
                    <Button onClick={() => { setConfirmDeleteId(null); setConfirmDeleteLabel(""); }} variant="outline">Cancel</Button>
                </div>
            </Modal>
        </div>
    );
}

export default Transactions;
