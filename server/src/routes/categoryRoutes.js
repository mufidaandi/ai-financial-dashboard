import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", protect, getCategories);
router.post("/", protect, addCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
