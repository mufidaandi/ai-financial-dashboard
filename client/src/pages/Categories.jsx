import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Sparkles, Plus } from "lucide-react";
import categoryService from "../services/categoryService";
import { getSuggestedCategories } from "../services/aiService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { Pill } from "../components/ui/pill";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");

  // Check if suggestions have already been fetched for this user
  const hasFetchedSuggestions = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = userData.email;
    if (!userEmail) return false;
    const suggestionsKey = `ai_suggestions_fetched_${userEmail}`;
    return localStorage.getItem(suggestionsKey) === "true";
  };

  useEffect(() => {
    fetchCategories();
    
    // Only fetch suggestions if not already fetched for this user
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = userData.email;
    const suggestionsKey = `ai_suggestions_fetched_${userEmail}`;
    const hasAlreadyFetched = localStorage.getItem(suggestionsKey);
    
    if (!hasAlreadyFetched && userEmail) {
      fetchSuggestedCategories();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setCategories([]);
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSuggestedCategories = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await getSuggestedCategories();
      setSuggestedCategories(response.suggestions || []);
      
      // Mark that suggestions have been fetched for this user
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userEmail = userData.email;
      if (userEmail) {
        const suggestionsKey = `ai_suggestions_fetched_${userEmail}`;
        localStorage.setItem(suggestionsKey, "true");
      }
    } catch (err) {
      setSuggestedCategories([]);
      console.error("Error fetching suggested categories:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const addSuggestedCategory = async (suggestedCategory) => {
    try {
      await categoryService.addCategory(suggestedCategory.name);
      // Remove from suggestions and refresh categories
      setSuggestedCategories(prev => prev.filter(cat => cat.name !== suggestedCategory.name));
      fetchCategories();
    } catch (err) {
      console.error("Error adding suggested category:", err);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await categoryService.addCategory(newCategory);
    setNewCategory("");
    fetchCategories();
    // Note: Removed automatic suggestion refresh to respect once-per-user limit
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await categoryService.updateCategory(editId, editName);
    setEditId(null);
    setEditName("");
    fetchCategories();
  };

  const handleDelete = async (id) => {
    await categoryService.deleteCategory(id);
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
    fetchCategories();
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">Categories</h1>
  <Button onClick={() => setShowModal(true)} className="dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-300">
          Add Category
        </Button>
      </div>
      
      {/* Modal for Add Category */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
  <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Add Category</h2>
        <form onSubmit={e => { handleAdd(e); setShowModal(false); }} className="flex flex-col gap-4">
          <Input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Add new category"
            required
          />
          <Button type="submit">Add</Button>
        </form>
      </Modal>
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg m-6">No categories added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            editId === cat._id ? (
              <form key={cat._id} onSubmit={handleUpdate} className="inline-flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-full px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                  autoFocus
                  style={{ width: `${Math.max(editName.length * 8, 100)}px` }}
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Check size={14} />
                </Button>
                <Button type="button" onClick={() => setEditId(null)} size="sm" variant="outline" className="h-8 w-8 p-0">
                  <X size={14} />
                </Button>
              </form>
            ) : (
              <Pill 
                key={cat._id}
                variant="primary"
                size="md"
                removable
                onRemove={() => { setConfirmDeleteId(cat._id); setConfirmDeleteName(cat.name); }}
                className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                onClick={() => handleEdit(cat._id, cat.name)}
              >
                {cat.name}
              </Pill>
            )
          ))}
        </div>
      )}

      {/* Suggested Categories Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold dark:text-gray-100">AI Suggested Categories</h2>
          <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          <Button
            onClick={fetchSuggestedCategories}
            variant="outline"
            size="sm"
            disabled={loadingSuggestions}
            className="ml-auto"
          >
            {loadingSuggestions ? "Generating..." : hasFetchedSuggestions() ? "Get New Suggestions" : "Get AI Suggestions"}
          </Button>
        </div>
        
        {loadingSuggestions ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Generating AI suggestions...</div>
            </CardContent>
          </Card>
        ) : suggestedCategories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 m-6">
              <Sparkles className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {hasFetchedSuggestions() ? (
                  <>
                    No new category suggestions available.
                    <br />
                    <span className="text-sm">You already have most common categories!</span>
                  </>
                ) : (
                  <>
                    AI suggestions not yet generated.
                    <br />
                    <span className="text-sm">Click "Get AI Suggestions" to get personalized category recommendations.</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedCategories.map((suggestion, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{suggestion.icon}</span>
                    <CardTitle className="text-base">{suggestion.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.description}</p>
                  <Button
                    onClick={() => addSuggestedCategory(suggestion)}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Category
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-80">
          <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Delete Category</h2>
            <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{confirmDeleteName}</span>?</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-red-600 text-white dark:bg-red-700 dark:text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }}
                className="bg-gray-300 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
