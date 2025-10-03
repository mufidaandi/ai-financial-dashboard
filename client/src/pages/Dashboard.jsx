import axios from "axios";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { CustomSelect, CustomSelectItem } from "../components/ui/custom-select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Calendar, Filter, CalendarRange, Brain, TrendingUp, ArrowRight, Bell, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { getSpendingInsights } from "../services/aiService";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableBadge } from "../components/ui/table";
import { CategoryPill, TypePill } from "../components/ui/pill";

function Dashboard() {
  const { formatCurrency } = useSettings();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [categorySpending, setCategorySpending] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [actualDisplayMonth, setActualDisplayMonth] = useState('');
  const [showingPreviousMonth, setShowingPreviousMonth] = useState(false);
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [isSelectingCustom, setIsSelectingCustom] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [dismissedReminders, setDismissedReminders] = useState(() => {
    const stored = localStorage.getItem('dismissedReminders');
    return stored ? JSON.parse(stored) : {};
  });

  // Helper function to filter transactions with fallback to previous month
  const filterTransactionsWithFallback = (txData, targetMonth, allowFallback = true) => {
    if (isCustomRange && customDateRange.startDate && customDateRange.endDate) {
      const startDate = new Date(customDateRange.startDate + 'T00:00:00');
      const endDate = new Date(customDateRange.endDate + 'T23:59:59');

      const filtered = txData.filter(tx => {
        // Extract date parts directly to avoid timezone issues
        const dateStr = tx.date.split('T')[0];
        const txDate = new Date(dateStr + 'T12:00:00'); // Use noon to avoid timezone edge cases
        return txDate >= startDate && txDate <= endDate;
      });

      return {
        transactions: filtered,
        actualMonth: 'custom',
        showingPrevious: false
      };
    }

    if (!targetMonth) return {
      transactions: txData,
      actualMonth: targetMonth,
      showingPrevious: false
    };

    const [year, month] = targetMonth.split('-');

    const currentMonthTransactions = txData.filter(tx => {
      // Extract date parts directly from the ISO string to avoid timezone issues
      const dateStr = tx.date.split('T')[0]; // Get just the YYYY-MM-DD part
      const [txYear, txMonth, txDay] = dateStr.split('-').map(Number);

      const matches = txYear === parseInt(year) && txMonth === parseInt(month);

      return matches;
    });

    // If we have transactions for the current month, use them
    if (currentMonthTransactions.length > 0 || !allowFallback) {
      return {
        transactions: currentMonthTransactions,
        actualMonth: targetMonth,
        showingPrevious: false
      };
    }

    // If no transactions in current month, try previous month
    const previousMonth = new Date(parseInt(year), parseInt(month) - 2, 1); // Go back one month
    const prevYear = previousMonth.getFullYear();
    const prevMonthNum = previousMonth.getMonth() + 1;

    const previousMonthTransactions = txData.filter(tx => {
      // Extract date parts directly from the ISO string to avoid timezone issues
      const dateStr = tx.date.split('T')[0]; // Get just the YYYY-MM-DD part
      const [txYear, txMonth, txDay] = dateStr.split('-').map(Number);

      return txYear === prevYear && txMonth === prevMonthNum;
    });

    if (previousMonthTransactions.length > 0) {
      const prevMonthString = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;
      return {
        transactions: previousMonthTransactions,
        actualMonth: prevMonthString,
        showingPrevious: true
      };
    }

    // If still no transactions, return empty array
    return {
      transactions: [],
      actualMonth: targetMonth,
      showingPrevious: false
    };
  };

  // Helper function to filter transactions by selected month or custom range
  const filterTransactionsByMonth = (txData) => {
    // Only allow fallback on initial load, not on user selection
    return filterTransactionsWithFallback(txData, selectedMonth, isInitialLoad);
  };

  // Helper function to generate month options for the dropdown
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    // Add custom range option
    options.push({ value: 'custom', label: 'Custom Range' });

    // Generate last 3 months
    for (let i = 3; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }


    return options;
  };

  // Helper function to get next date for a specific day of month
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

  // Helper function to get days until a date
  const getDaysUntil = (date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to generate reminders from credit card accounts
  const generateReminders = (accountsData) => {
    const today = new Date();
    const reminders = [];

    accountsData.forEach(account => {
      if (account.type === 'Credit Card') {
        const accountId = account._id;
        const reminderKey = `${accountId}-${today.getFullYear()}-${today.getMonth()}`;

        // Skip if this reminder has been dismissed this month
        if (dismissedReminders[reminderKey]) {
          return;
        }

        // Due date reminder
        if (account.dueDate) {
          const dueDate = getNextDate(account.dueDate);
          const daysUntilDue = getDaysUntil(dueDate);

          if (daysUntilDue <= 7 && daysUntilDue >= 0) { // Show reminders 7 days before due date
            let priority = 'low';
            if (daysUntilDue <= 1) priority = 'high';
            else if (daysUntilDue <= 3) priority = 'medium';

            reminders.push({
              id: `due-${accountId}`,
              type: 'due',
              accountName: account.name,
              accountId,
              date: dueDate,
              daysUntil: daysUntilDue,
              priority,
              title: `${account.name} Payment Due`,
              description: daysUntilDue === 0 ? 'Due Today!' :
                daysUntilDue === 1 ? 'Due Tomorrow!' :
                  `Due in ${daysUntilDue} days`
            });
          }
        }

        // Statement date reminder (optional - for when new statement is generated)
        if (account.statementDate) {
          const statementDate = getNextDate(account.statementDate);
          const daysUntilStatement = getDaysUntil(statementDate);

          if (daysUntilStatement <= 2 && daysUntilStatement >= 0) { // Show 2 days before statement
            reminders.push({
              id: `statement-${accountId}`,
              type: 'statement',
              accountName: account.name,
              accountId,
              date: statementDate,
              daysUntil: daysUntilStatement,
              priority: 'low',
              title: `${account.name} Statement`,
              description: daysUntilStatement === 0 ? 'Statement generated today' :
                daysUntilStatement === 1 ? 'Statement tomorrow' :
                  `Statement in ${daysUntilStatement} days`
            });
          }
        }
      }
    });

    return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  // Function to dismiss a reminder
  const handleDismissReminder = (reminder) => {
    const today = new Date();
    const reminderKey = `${reminder.accountId}-${today.getFullYear()}-${today.getMonth()}`;

    const newDismissed = {
      ...dismissedReminders,
      [reminderKey]: true
    };

    setDismissedReminders(newDismissed);
    localStorage.setItem('dismissedReminders', JSON.stringify(newDismissed));

    // Update reminders list to remove the dismissed one
    setReminders(generateReminders(accounts));
  };

  // Handle month/range selection
  const handleFilterChange = (value) => {
    if (value === 'custom') {
      setIsSelectingCustom(true);
      setShowCustomRangeModal(true);
    } else {
      setSelectedMonth(value);
      setIsCustomRange(false);
      setIsSelectingCustom(false);
      setIsInitialLoad(false); // Disable fallback after user selection
    }
  };

  // Handle custom date range submission
  const handleCustomRangeSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setIsCustomRange(true);
      setIsSelectingCustom(false);
      setSelectedMonth(''); // Clear selected month when using custom range
      setShowCustomRangeModal(false);
      setIsInitialLoad(false); // Disable fallback after user selection
    }
  };

  // Handle modal close (cancel)
  const handleModalClose = () => {
    setShowCustomRangeModal(false);
    setIsSelectingCustom(false);
  };

  // Get display value for the filter
  const getFilterDisplayValue = () => {
    if (isSelectingCustom || (isCustomRange && customDateRange.startDate && customDateRange.endDate)) {
      return 'custom';
    }
    // Always show the month the user selected, not the fallback month
    // The "showing previous month data" indicator will tell them when fallback occurs
    return selectedMonth;
  };

  // Get display label for custom range
  const getCustomRangeLabel = () => {
    if (isCustomRange && customDateRange.startDate && customDateRange.endDate) {
      const startDate = new Date(customDateRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = new Date(customDateRange.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startDate} - ${endDate}`;
    }
    return 'Custom Range';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = userData?.token;
        if (!token) throw new Error("No auth token found");

        // Fetch all data in parallel
        const [txRes, catRes, accRes] = await Promise.all([
          axios.get("http://localhost:3000/api/transactions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/accounts", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const txData = Array.isArray(txRes?.data) ? txRes.data : [];
        const catData = Array.isArray(catRes?.data) ? catRes.data : [];
        const accData = Array.isArray(accRes?.data) ? accRes.data : [];

        setTransactions(txData);
        setCategories(catData);
        setAccounts(accData);

        // Generate reminders from account data
        const accountReminders = generateReminders(accData);
        setReminders(accountReminders);

        // Filter transactions by selected month with fallback logic
        const filterResult = filterTransactionsByMonth(txData);
        const filteredTransactions = filterResult.transactions;

        // Update display state based on filter result
        setActualDisplayMonth(filterResult.actualMonth);
        setShowingPreviousMonth(filterResult.showingPrevious);
        setFilteredTransactions(filteredTransactions);

        // Calculate income/expenses using the type field for filtered data
        let incomeSum = 0, expenseSum = 0;
        const catMap = {};
        let uncategorizedAmount = 0;

        filteredTransactions.forEach(tx => {
          if (typeof tx.amount !== "number") return;

          if (tx.type === "income") {
            incomeSum += tx.amount;
          } else if (tx.type === "expense") {
            expenseSum += tx.amount;
            // Track category spending for expenses
            if (tx.category) {
              const category = catData.find(cat => cat._id === tx.category);
              const categoryName = category?.name || "Unknown Category";
              catMap[categoryName] = (catMap[categoryName] || 0) + tx.amount;
            } else {
              // Include uncategorized transactions
              uncategorizedAmount += tx.amount;
            }
          }
        });

        // Add current account balances to income (Savings and Checking accounts only)
        let accountBalanceSum = 0;
        accData.forEach(account => {
          if ((account.type === "Savings" || account.type === "Checking") && typeof account.balance === "number") {
            accountBalanceSum += account.balance;
          }
        });

        // Total income includes transaction income + account balances
        const totalIncome = incomeSum + accountBalanceSum;

        // Add uncategorized amount to the category map if it exists
        if (uncategorizedAmount > 0) {
          catMap["Uncategorized"] = uncategorizedAmount;
        }
        setIncome(totalIncome);
        setExpenses(expenseSum);
        setCategorySpending(Object.entries(catMap));

        // Fetch AI insights after transaction data is loaded
        if (filteredTransactions.length > 0) {
          fetchInsights();
        }

        // Mark initial load as complete
        setIsInitialLoad(false);
      } catch (err) {
        setTransactions([]);
        setFilteredTransactions([]);
        setCategories([]);
        setAccounts([]);
        setIncome(0);
        setExpenses(0);
        setCategorySpending([]);
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, [selectedMonth, isCustomRange, customDateRange]); // Add custom range dependencies

  // Fetch AI insights
  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await getSpendingInsights();
      setInsights(response.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Page Header with Month Filter */}
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">Dashboard</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground dark:text-gray-400">Welcome back! Here's your financial overview.</p>
              {showingPreviousMonth && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-200 dark:border-blue-800">
                  <ArrowRight className="h-3 w-3 rotate-180" />
                  <span>Showing previous month data</span>
                </div>
              )}
            </div>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <CustomSelect
              value={getFilterDisplayValue()}
              onValueChange={handleFilterChange}
              placeholder="Select Month"
              className="min-w-[180px]"
            >
              {generateMonthOptions().map(option => (
                <CustomSelectItem key={option.value} value={option.value}>
                  {option.value === 'custom' && isCustomRange ? getCustomRangeLabel() : option.label}
                </CustomSelectItem>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      <Modal open={showCustomRangeModal} onClose={handleModalClose}>
        <div className="p-2">
          <div className="flex items-center gap-2 mb-6">
            <CalendarRange className="h-5 w-5" />
            <h2 className="text-xl font-semibold dark:text-gray-100">Select Custom Date Range</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                Start Date
              </label>
              <Input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-100">
                End Date
              </label>
              <Input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                className="w-full"
                min={customDateRange.startDate}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomRangeSubmit}
              disabled={!customDateRange.startDate || !customDateRange.endDate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Range
            </Button>
          </div>
        </div>
      </Modal>

      {/* Income & Expenses Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Available</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-3xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(income)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-3xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(expenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-3xl font-semibold dark:text-gray-100">{formatCurrency(income - expenses)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Payment Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Transactions Table - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead align="right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.slice(0, 5).map(tx => (
                    <TableRow key={tx._id}>
                      <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        {tx.type === "income" ? (
                          <TypePill type="income" />
                        ) : tx.category ? (
                          categories.find(cat => cat._id === tx.category) ? (
                            <CategoryPill category={categories.find(cat => cat._id === tx.category)?.name} />
                          ) : (
                            <CategoryPill category="Unknown Category" />
                          )
                        ) : (
                          <CategoryPill category="N/A" />
                        )}
                      </TableCell>
                      <TableCell align="right" className={`font-semibold ${tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-400">
                        No transactions found for selected month.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Payment Reminders - 1/3 width */}
        {reminders.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-orange-500" />
                  Payment Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {reminders.slice(0, 3).map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-3 rounded-lg border-l-4 ${reminder.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                        reminder.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                          'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className={`p-1.5 rounded-full ${reminder.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                            reminder.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                              'bg-blue-100 dark:bg-blue-900/20'
                            }`}>
                            {reminder.type === 'due' && <CreditCard className="h-3 w-3 text-red-600 dark:text-red-400" />}
                            {reminder.type === 'statement' && <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">
                              {reminder.accountName}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              {reminder.description}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${reminder.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                                reminder.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                                  'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                }`}>
                                {reminder.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDismissReminder(reminder)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-xs px-2 py-1 h-6 shrink-0"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Paid
                        </Button>
                      </div>
                    </div>
                  ))}
                  {reminders.length > 3 && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{reminders.length - 3} more reminder{reminders.length - 3 !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty space when no reminders */}
        {reminders.length === 0 && (
          <div className="lg:col-span-1">
            {/* This maintains the layout even when no reminders */}
          </div>
        )}
      </div>


      {/* AI Recommendations */}
      <div className="mb-6">
        {(insights?.aiRecommendations?.length > 0 || insightsLoading) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-blue-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {insightsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Generating insights...</span>
                </div>
              ) : insights?.aiRecommendations?.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {insights.aiRecommendations.slice(0, 3).map((rec, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                        rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                          'border-green-500 bg-green-50 dark:bg-green-900/10'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-full ${rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                          rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                            'bg-green-100 dark:bg-green-900/20'
                          }`}>
                          {rec.type === 'savings' && <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />}
                          {rec.type === 'budgeting' && <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                          {rec.type === 'category' && <Filter className="h-3 w-3 text-purple-600 dark:text-purple-400" />}
                          {rec.type === 'general' && <Brain className="h-3 w-3 text-gray-600 dark:text-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {rec.description}
                          </p>
                          <div className="mt-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                              rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                                'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {insights.aiRecommendations.length > 3 && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{insights.aiRecommendations.length - 3} more recommendation{insights.aiRecommendations.length - 3 !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No recommendations available yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add more transactions to get personalized insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Spending by Category - Full Width */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categorySpending.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending.map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="40%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `$${value.toLocaleString()}`,
                        name // Show full category name in tooltip
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => {
                        // Show full name in legend, truncate if too long
                        return value.length > 15 ? value.substring(0, 15) + '...' : value;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">No spending data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
