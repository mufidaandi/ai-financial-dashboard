import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching categories" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name, user: req.user._id });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error adding category" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error updating category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) return res.status(404).json({ message: "Category not found" });
    
    // First, update all transactions that use this category to set category to null
    await Transaction.updateMany(
      { category: req.params.id, user: req.user._id },
      { $unset: { category: "" } }
    );
    
    // Then delete the category
    await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    res.json({ message: "Category deleted and associated transactions updated" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Server error deleting category" });
  }
};
