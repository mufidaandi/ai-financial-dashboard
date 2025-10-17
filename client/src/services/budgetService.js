import API from "../api";

const budgetService = {
  // Get all budgets for the current user
  getBudgets: async () => {
    const response = await API.get("/budgets");
    return response.data;
  },

  // Get a specific budget by ID
  getBudgetById: async (id) => {
    const response = await API.get(`/budgets/${id}`);
    return response.data;
  },

  // Create a new budget
  addBudget: async (budgetData) => {
    const response = await API.post("/budgets", budgetData);
    return response.data;
  },

  // Update an existing budget
  updateBudget: async (id, budgetData) => {
    const response = await API.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  // Delete a budget
  deleteBudget: async (id) => {
    const response = await API.delete(`/budgets/${id}`);
    return response.data;
  },

  // Get budget progress and spending data
  getBudgetProgress: async () => {
    const response = await API.get("/budgets/progress");
    return response.data;
  },

  // Get budget summary for dashboard
  getBudgetSummary: async () => {
    const response = await API.get("/budgets/summary");
    return response.data;
  }
};

export default budgetService;