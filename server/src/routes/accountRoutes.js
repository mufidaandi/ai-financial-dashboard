import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  recalculateBalances,
  fixAccountIndexes,
} from "../controllers/accountController.js";

const router = express.Router();

router.get("/", protect, getAccounts);
router.post("/", protect, addAccount);
router.put("/:id", protect, updateAccount);
router.delete("/:id", protect, deleteAccount);
router.post("/recalculate-balances", protect, recalculateBalances);
router.post("/fix-indexes", protect, fixAccountIndexes);

export default router;
