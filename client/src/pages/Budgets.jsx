import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus, Calendar, DollarSign, Target, AlertTriangle, TrendingUp } from "lucide-react";
import budgetService from "../services/budgetService";
import categoryService from "../services/categoryService";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";
import { useOnboarding } from "../context/OnboardingContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { CustomSelect, CustomSelectItem } from "../components/ui/custom-select";
import { Modal } from "../components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CategoryPill } from "../components/ui/pill";

function Budgets() {
    const { success, error } = useToast();
    const { formatCurrency } = useSettings();
    const { markMilestone } = useOnboarding();
    const [budgets, setBudgets] = useState([]);
    const [budgetProgress, setBudgetProgress] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const getToday = () => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    };
    
    const [form, setForm] = useState({
        name: "",
        category: "",
        amount: "",
        period: "monthly",
        startDate: "",
        endDate: "",
        description: "",
        warningThreshold: "80",
        alertThreshold: "100"
    });
    
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteName, setConfirmDeleteName] = useState("");

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [budgetsData, progressData, categoriesData] = await Promise.all([
                budgetService.getBudgets(),
                budgetService.getBudgetProgress(),
                categoryService.getCategories()
            ]);
            
            setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
            setBudgetProgress(Array.isArray(progressData) ? progressData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (err) {
            console.error("Error fetching data:", err);
            error("Failed to load budget data");
            setBudgets([]);
            setBudgetProgress([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };



    const handleEdit = (budget) => {
        setEditId(budget.category._id); // Use category ID for editing
        setEditForm({
            name: budget.name,
            category: budget.category._id,
            amount: budget.amount,
            period: budget.period,
            warningThreshold: budget.warningThreshold,
            alertThreshold: budget.alertThreshold
        });
    };

    const handleAddBudgetForCategory = (category) => {
        setEditId(category._id);
        setEditForm({
            name: `${category.name} Budget`,
            category: category._id,
            amount: '',
            period: 'monthly',
            warningThreshold: 80,
            alertThreshold: 95
        });
    };    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (!editForm.name || !editForm.category || !editForm.amount || !editForm.period) {
            error("Please fill in all required fields");
            return;
        }
        
        if (parseFloat(editForm.amount) <= 0) {
            error("Budget amount must be greater than 0");
            return;
        }
        
        try {
            const payload = {
                ...editForm,
                amount: parseFloat(editForm.amount),
                warningThreshold: parseFloat(editForm.warningThreshold),
                alertThreshold: parseFloat(editForm.alertThreshold)
            };
            
            // Check if this is creating a new budget or updating an existing one
            const existingBudget = budgetProgress.find(bp => bp.budget.category._id === editForm.category);
            
            if (existingBudget) {
                // Update existing budget
                await budgetService.updateBudget(existingBudget.budget._id, payload);
                success("Budget updated successfully!");
            } else {
                // Create new budget
                await budgetService.addBudget(payload);
                success("Budget created successfully!");
                
                // Mark milestone: user has created their first budget
                if (budgets.length === 0) {
                    await markMilestone('hasCreatedBudget');
                    console.log('First budget milestone marked');
                }
            }
            
            setEditId(null);
            setEditForm({});
            fetchAll();
        } catch (err) {
            console.error("Error saving budget:", err);
            error(err.response?.data?.message || "Failed to save budget");
        }
    };

    const handleDelete = async (id) => {
        try {
            await budgetService.deleteBudget(id);
            success("Budget deleted successfully!");
            setConfirmDeleteId(null);
            setConfirmDeleteName("");
            fetchAll();
        } catch (err) {
            console.error("Error deleting budget:", err);
            error("Failed to delete budget");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'on-track':
                return 'text-green-600 dark:text-green-400';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'at-limit':
                return 'text-orange-600 dark:text-orange-400';
            case 'over-budget':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'on-track':
                return <TrendingUp className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'at-limit':
                return <Target className="h-4 w-4" />;
            case 'over-budget':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Target className="h-4 w-4" />;
        }
    };

    const getProgressBarColor = (status) => {
        switch (status) {
            case 'on-track':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'at-limit':
                return 'bg-orange-500';
            case 'over-budget':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading budgets...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-gray-100">Budgets</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Set spending limits for each category to track your financial goals
                    </p>
                </div>
            </div>

            {/* Budget Summary Cards */}
            {budgetProgress.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Budgeted
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(budgetProgress.reduce((sum, bp) => sum + bp.budget.amount, 0))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Spent
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(budgetProgress.reduce((sum, bp) => sum + bp.totalSpent, 0))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Remaining
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(budgetProgress.reduce((sum, bp) => sum + bp.remaining, 0))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}



            {/* Categories with Budget Management */}
            {categories.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 pt-4">
                        <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No categories found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">You need to create categories before setting up budgets</p>
                        <Button onClick={() => window.location.href = '/categories'} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Go to Categories
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {categories.map(category => {
                        // Find existing budget for this category
                        const existingBudget = budgetProgress.find(bp => bp.budget.category._id === category._id);
                        
                        return (
                            <Card key={category._id} className="relative">
                                {editId === category._id ? (
                                    <form onSubmit={handleUpdate} className="p-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CategoryPill category={category.name} />
                                                <span className="text-sm text-gray-500">Budget</span>
                                            </div>
                                            
                                            <Input 
                                                name="amount" 
                                                type="number" 
                                                value={editForm.amount} 
                                                onChange={handleEditChange} 
                                                step="0.01" 
                                                min="0.01" 
                                                placeholder="Budget amount"
                                                required 
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    className={`px-3 py-2 rounded-lg font-medium border transition-colors ${
                                                        editForm.period === "monthly" 
                                                            ? "bg-blue-600 text-white" 
                                                            : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                                                    }`}
                                                    onClick={() => setEditForm({ ...editForm, period: "monthly" })}
                                                >
                                                    Monthly
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-3 py-2 rounded-lg font-medium border transition-colors ${
                                                        editForm.period === "yearly" 
                                                            ? "bg-blue-600 text-white" 
                                                            : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                                                    }`}
                                                    onClick={() => setEditForm({ ...editForm, period: "yearly" })}
                                                >
                                                    Yearly
                                                </button>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Button type="submit" variant="secondary" className="flex-1">
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Save Budget
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    className="flex-1"
                                                    onClick={() => setEditId(null)}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                                                        <CategoryPill category={category.name} />
                                                        {existingBudget && (
                                                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                                {existingBudget.budget.period}
                                                            </span>
                                                        )}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {existingBudget ? (
                                                        <>
                                                            <Button 
                                                                onClick={() => handleEdit(existingBudget.budget)} 
                                                                variant="ghost" 
                                                                className="p-1 text-blue-600 dark:text-blue-300" 
                                                                title="Edit Budget"
                                                            >
                                                                <Pencil size={16} />
                                                            </Button>
                                                            <Button 
                                                                onClick={() => { 
                                                                    setConfirmDeleteId(existingBudget.budget._id); 
                                                                    setConfirmDeleteName(category.name); 
                                                                }} 
                                                                variant="ghost" 
                                                                className="p-1 text-red-600 dark:text-red-400" 
                                                                title="Remove Budget"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button 
                                                            onClick={() => handleAddBudgetForCategory(category)} 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="flex items-center gap-1"
                                                            data-tour="add-budget"
                                                        >
                                                            <Plus size={14} />
                                                            Add Budget
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        
                                        <CardContent className="pt-0">
                                            {existingBudget ? (
                                                <div className="space-y-4" data-tour="budget-progress">
                                                    {/* Budget Amount and Status */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Budget</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm flex items-center gap-1 ${getStatusColor(existingBudget.status)}`} data-tour="budget-status">
                                                                {getStatusIcon(existingBudget.status)}
                                                                {existingBudget.status.replace('-', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(existingBudget.budget.amount)}
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                Spent: {formatCurrency(existingBudget.totalSpent)}
                                                            </span>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {existingBudget.percentageSpent.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(existingBudget.status)}`}
                                                                style={{ width: `${Math.min(existingBudget.percentageSpent, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Remaining Amount */}
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                                                        <span className={`font-semibold ${
                                                            existingBudget.remaining > 0 
                                                                ? 'text-green-600 dark:text-green-400' 
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {formatCurrency(existingBudget.remaining)}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Transaction Count */}
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {existingBudget.transactionCount} transaction{existingBudget.transactionCount !== 1 ? 's' : ''} this {existingBudget.budget.period.slice(0, -2)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center">
                                                    <Target className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                                                        No budget set for this category
                                                    </p>
                                                    <p className="text-gray-400 dark:text-gray-500 text-xs">
                                                        Click "Add Budget" to start tracking spending
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal open={confirmDeleteId} onClose={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }}>
                <h2 className="text-xl font-bold mb-4">Delete Budget</h2>
                <p className="mb-6">
                    Are you sure you want to delete the budget <span className="font-semibold">"{confirmDeleteName}"</span>? 
                    This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-end">
                    <Button onClick={() => handleDelete(confirmDeleteId)} variant="destructive">
                        Delete
                    </Button>
                    <Button 
                        onClick={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }} 
                        variant="outline"
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default Budgets;