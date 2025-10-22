import { useEffect, useState } from "react";
import { Brain, TrendingUp, TrendingDown, DollarSign, PieChart, AlertTriangle, CheckCircle, Target, Lightbulb, RefreshCw, Clock, Database } from "lucide-react";
import { getSpendingInsights } from "../services/aiService";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

function Insights() {
    const { success, error } = useToast();
    const { formatCurrency } = useSettings();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [isFromCache, setIsFromCache] = useState(false);
    const [generatedAt, setGeneratedAt] = useState(null);
    const [transactionCount, setTransactionCount] = useState(0);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async (forceRegenerate = false) => {
        try {
            if (forceRegenerate) {
                setRegenerating(true);
            } else {
                setLoading(true);
            }

            const url = forceRegenerate ? '/ai/insights?forceRegenerate=true' : '/ai/insights';
            const data = await getSpendingInsights(url);

            setInsights(data.insights);
            setIsFromCache(data.isFromCache);
            setGeneratedAt(new Date(data.generatedAt));
            setTransactionCount(data.transactionCount);

            console.log("Insights data:", data);

            if (forceRegenerate && !data.isFromCache) {
                success("AI insights regenerated successfully!");
            }
        } catch (err) {
            console.error("Error fetching insights:", err);
            error("Failed to load spending insights. Please try again.");
        } finally {
            setLoading(false);
            setRegenerating(false);
        }
    };

    const handleRegenerateInsights = () => {
        fetchInsights(true);
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'spending_pattern': return <TrendingUp className="h-5 w-5" />;
            case 'budget_alert': return <AlertTriangle className="h-5 w-5" />;
            case 'savings_opportunity': return <Target className="h-5 w-5" />;
            case 'category_analysis': return <PieChart className="h-5 w-5" />;
            case 'trend_analysis': return <TrendingDown className="h-5 w-5" />;
            case 'savings': return <DollarSign className="h-5 w-5" />;
            case 'budgeting': return <Target className="h-5 w-5" />;
            case 'category': return <PieChart className="h-5 w-5" />;
            case 'general': return <Lightbulb className="h-5 w-5" />;
            default: return <Lightbulb className="h-5 w-5" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'medium': return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-green-700 dark:text-green-400';
        if (score >= 60) return 'text-blue-600 dark:text-blue-400';
        if (score >= 40) return 'text-yellow-700 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Colors for charts
    const CHART_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                        <Brain className="h-8 w-8 animate-pulse text-blue-600" />
                        <span className="text-lg text-gray-600 dark:text-gray-400">
                            {regenerating ? "Regenerating insights with AI..." : "Loading your financial insights..."}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Unable to load insights</p>
                    <button
                        onClick={() => fetchInsights()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-100">AI Spending Insights</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                AI-powered analysis of your financial patterns • {transactionCount} transactions analyzed
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Cache Status Indicator */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {isFromCache ? (
                                <>
                                    <Database className="h-4 w-4" />
                                    <span>Cached</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Fresh</span>
                                </>
                            )}
                            <span>•</span>
                            <Clock className="h-4 w-4" />
                            <span>{generatedAt ? formatDate(generatedAt) : 'Unknown'}</span>
                        </div>

                        <button
                            onClick={handleRegenerateInsights}
                            disabled={regenerating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                            {regenerating ? 'Regenerating...' : 'Regenerate Insights'}
                        </button>
                    </div>
                </div>

                {/* Financial Health Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Financial Health Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${getHealthColor(insights.financialHealthScore)}`}>
                                {insights.financialHealthScore}/100
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {formatCurrency(insights.totalSpent)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {formatCurrency(insights.averageDaily)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Daily Average</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${insights.trends.spendingTrend === 'increasing' ? 'text-red-600' : insights.trends.spendingTrend === 'decreasing' ? 'text-green-700' : 'text-blue-600'}`}>
                                {insights.trends.spendingTrend === 'increasing' ? '↑' : insights.trends.spendingTrend === 'decreasing' ? '↓' : '→'}
                                {Math.abs(insights.trends.trendPercentage).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Spending Trend</div>
                        </div>
                    </div>
                </div>

                {/* Health Factors */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Health Factors</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className={`text-xl font-bold ${getHealthColor(insights.healthFactors.categoryDiversity)}`}>
                                {insights.healthFactors.categoryDiversity.toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Category Diversity</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-xl font-bold ${getHealthColor(insights.healthFactors.spendingConsistency)}`}>
                                {insights.healthFactors.spendingConsistency.toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Spending Consistency</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-xl font-bold ${getHealthColor(insights.healthFactors.budgetAdherence)}`}>
                                {insights.healthFactors.budgetAdherence.toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Budget Adherence</div>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations */}
                {insights.aiRecommendations && insights.aiRecommendations.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-4 dark:text-gray-100 flex items-center gap-2">
                            <Brain className="h-5 w-5 text-blue-600" />
                            AI Recommendations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insights.aiRecommendations.map((recommendation, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {getInsightIcon(recommendation.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm mb-1">
                                                {recommendation.title}
                                            </h3>
                                            <p className="text-sm opacity-90">
                                                {recommendation.description}
                                            </p>
                                            <div className="mt-2 text-xs uppercase tracking-wide font-medium">
                                                {recommendation.priority} Priority
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Breakdown */}
                {insights.categoryBreakdown && insights.categoryBreakdown.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Spending by Category</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Pie Chart */}
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={insights.categoryBreakdown.slice(0, 8)}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="amount"
                                            label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                                            labelLine={false}
                                        >
                                            {insights.categoryBreakdown.slice(0, 8).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Category List */}
                            <div className="space-y-3">
                                {insights.categoryBreakdown.slice(0, 8).map((category, index) => (
                                    <div key={category.category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                            ></div>
                                            <span className="text-gray-700 dark:text-gray-300">{category.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                {formatCurrency(category.amount)}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {category.percentage.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
}

export default Insights;