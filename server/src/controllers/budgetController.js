import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    res.json(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ message: "Server error fetching budgets" });
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id })
      .populate('category', 'name');
    
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.json(budget);
  } catch (err) {
    console.error("Error fetching budget:", err);
    res.status(500).json({ message: "Server error fetching budget" });
  }
};

export const addBudget = async (req, res) => {
  try {
    const { name, category, amount, period, startDate, endDate, description, warningThreshold, alertThreshold } = req.body;
    
    // Validation
    if (!name || !category || !amount || !period) {
      return res.status(400).json({ message: "Name, category, amount, and period are required" });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ message: "Budget amount must be greater than 0" });
    }
    
    if (!["monthly", "yearly"].includes(period)) {
      return res.status(400).json({ message: "Period must be 'monthly' or 'yearly'" });
    }
    
    // Verify category exists and belongs to user
    const categoryExists = await Category.findOne({ _id: category, user: req.user._id });
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found or doesn't belong to user" });
    }
    
    // Check for duplicate budget name for the same user and period
    const existingBudget = await Budget.findOne({ 
      name, 
      user: req.user._id,
      period 
    });
    if (existingBudget) {
      return res.status(400).json({ message: `Budget name already exists for ${period} period` });
    }
    
    // Set default dates if not provided
    let budgetStartDate = startDate;
    let budgetEndDate = endDate;
    
    if (!budgetStartDate || !budgetEndDate) {
      const now = new Date();
      if (period === 'monthly') {
        budgetStartDate = budgetStartDate || new Date(now.getFullYear(), now.getMonth(), 1);
        budgetEndDate = budgetEndDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (period === 'yearly') {
        budgetStartDate = budgetStartDate || new Date(now.getFullYear(), 0, 1);
        budgetEndDate = budgetEndDate || new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      }
    }
    
    const budgetData = {
      name,
      user: req.user._id,
      category,
      amount: parseFloat(amount),
      period,
      startDate: budgetStartDate,
      endDate: budgetEndDate,
      description: description || '',
      warningThreshold: warningThreshold || 80,
      alertThreshold: alertThreshold || 100
    };
    
    const budget = new Budget(budgetData);
    await budget.save();
    
    // Populate category before sending response
    await budget.populate('category', 'name');
    
    res.status(201).json(budget);
  } catch (err) {
    console.error("Error adding budget:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Budget name already exists for this period" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error adding budget" });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { name, category, amount, period, startDate, endDate, description, warningThreshold, alertThreshold, isActive } = req.body;
    
    // Find existing budget
    const existingBudget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!existingBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    // Validation
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: "Budget amount must be greater than 0" });
    }
    
    if (period && !["monthly", "yearly"].includes(period)) {
      return res.status(400).json({ message: "Period must be 'monthly' or 'yearly'" });
    }
    
    // Verify category exists and belongs to user if category is being updated
    if (category && category !== existingBudget.category.toString()) {
      const categoryExists = await Category.findOne({ _id: category, user: req.user._id });
      if (!categoryExists) {
        return res.status(400).json({ message: "Category not found or doesn't belong to user" });
      }
    }
    
    // Check for duplicate budget name if name or period is being updated
    if ((name && name !== existingBudget.name) || (period && period !== existingBudget.period)) {
      const duplicateBudget = await Budget.findOne({ 
        name: name || existingBudget.name, 
        user: req.user._id,
        period: period || existingBudget.period,
        _id: { $ne: req.params.id }
      });
      if (duplicateBudget) {
        return res.status(400).json({ message: `Budget name already exists for ${period || existingBudget.period} period` });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (period !== undefined) updateData.period = period;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (description !== undefined) updateData.description = description;
    if (warningThreshold !== undefined) updateData.warningThreshold = warningThreshold;
    if (alertThreshold !== undefined) updateData.alertThreshold = alertThreshold;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.json(budget);
  } catch (err) {
    console.error("Error updating budget:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Budget name already exists for this period" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error updating budget" });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ message: "Server error deleting budget" });
  }
};

// Get budget progress and spending data
export const getBudgetProgress = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id, isActive: true })
      .populate('category', 'name');
    
    const budgetProgress = [];
    
    for (const budget of budgets) {
      // Calculate current period dates
      const currentStart = budget.currentPeriodStart;
      const currentEnd = budget.currentPeriodEnd;
      
      // Get transactions for this budget's category within the current period
      const transactions = await Transaction.find({
        user: req.user._id,
        category: budget.category._id,
        type: 'expense',
        date: {
          $gte: currentStart,
          $lte: currentEnd
        }
      });
      
      // Calculate total spent
      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const percentageSpent = budget.amount > 0 ? (Math.abs(totalSpent / budget.amount)) * 100 : 0;
      
      // Determine status
      let status = 'on-track';
      if (percentageSpent > 100) {
        // Actually over budget (spent more than allocated)
        status = 'over-budget';
      } else if (percentageSpent === 100) {
        // Exactly at budget limit
        status = 'at-limit';
      } else if (percentageSpent >= budget.alertThreshold) {
        // Close to budget limit but not over
        status = 'warning';
      } else if (percentageSpent >= budget.warningThreshold) {
        // Approaching budget limit
        status = 'warning';
      }
      
      budgetProgress.push({
        budget: budget,
        totalSpent: totalSpent,
        remaining: Math.max(0, budget.amount + totalSpent),
        percentageSpent: Math.round(percentageSpent * 100) / 100,
        status: status,
        currentPeriodStart: currentStart,
        currentPeriodEnd: currentEnd,
        transactionCount: transactions.length,
        isCurrentlyActive: budget.isCurrentlyActive()
      });
    }
    
    res.json(budgetProgress);
  } catch (err) {
    console.error("Error fetching budget progress:", err);
    res.status(500).json({ message: "Server error fetching budget progress" });
  }
};

// Get budget summary for dashboard
export const getBudgetSummary = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id, isActive: true })
      .populate('category', 'name');
    
    let totalBudgeted = 0;
    let totalSpent = 0;
    let budgetsOverLimit = 0;
    let budgetsNearLimit = 0;
    
    for (const budget of budgets) {
      if (!budget.isCurrentlyActive()) continue;
      
      const currentStart = budget.currentPeriodStart;
      const currentEnd = budget.currentPeriodEnd;
      
      // Get spending for this budget's category
      const transactions = await Transaction.find({
        user: req.user._id,
        category: budget.category._id,
        type: 'expense',
        date: {
          $gte: currentStart,
          $lte: currentEnd
        }
      });
      
      const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const percentageSpent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      totalBudgeted += budget.amount;
      totalSpent += spent;
      
      if (percentageSpent > 100) {
        budgetsOverLimit++;
      } else if (percentageSpent >= budget.warningThreshold) {
        budgetsNearLimit++;
      }
    }
    
    res.json({
      totalBudgets: budgets.length,
      totalBudgeted: totalBudgeted,
      totalSpent: totalSpent,
      remaining: Math.max(0, totalBudgeted + totalSpent),
      budgetsOverLimit: budgetsOverLimit,
      budgetsNearLimit: budgetsNearLimit,
      overallPercentage: totalBudgeted > 0 ? Math.abs(Math.round((totalSpent / totalBudgeted)) * 100 * 100) / 100 : 0
    });
  } catch (err) {
    console.error("Error fetching budget summary:", err);
    res.status(500).json({ message: "Server error fetching budget summary" });
  }
};