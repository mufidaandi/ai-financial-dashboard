import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBudgets,
  getBudgetById,
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
  getBudgetSummary,
} from "../controllers/budgetController.js";

const router = express.Router();

router.get("/", protect, getBudgets);
router.get("/progress", protect, getBudgetProgress);
router.get("/summary", protect, getBudgetSummary);
router.get("/:id", protect, getBudgetById);
router.post("/", protect, addBudget);
router.put("/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);

export default router;