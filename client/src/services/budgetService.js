import API from "../api";
import { 
  getCachedBudgets,
  getCachedBudgetById,
  getCachedBudgetProgress,
  getCachedBudgetSummary,
  CacheService 
} from "./cacheService";

const budgetService = {
  // Get all budgets for the current user
  getBudgets: async () => {
    return await getCachedBudgets(async () => {
      const response = await API.get("/budgets");
      return response.data;
    });
  },

  // Get a specific budget by ID
  getBudgetById: async (id) => {
    return await getCachedBudgetById(id, async () => {
      const response = await API.get(`/budgets/${id}`);
      return response.data;
    });
  },

  // Create a new budget
  addBudget: async (budgetData) => {
    const response = await API.post("/budgets", budgetData);
    CacheService.clearPatterns.budgetOperation();
    return response.data;
  },

  // Update an existing budget
  updateBudget: async (id, budgetData) => {
    const response = await API.put(`/budgets/${id}`, budgetData);
    CacheService.clearPatterns.specificBudget(id);
    return response.data;
  },

  // Delete a budget
  deleteBudget: async (id) => {
    const response = await API.delete(`/budgets/${id}`);
    CacheService.clearPatterns.specificBudget(id);
    return response.data;
  },

  // Get budget progress and spending data
  getBudgetProgress: async () => {
    return await getCachedBudgetProgress(async () => {
      const response = await API.get("/budgets/progress");
      return response.data;
    });
  },

  // Get budget summary for dashboard
  getBudgetSummary: async () => {
    return await getCachedBudgetSummary(async () => {
      const response = await API.get("/budgets/summary");
      return response.data;
    });
  }
};

export default budgetService;