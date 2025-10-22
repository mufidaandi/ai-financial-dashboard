import API from "../api";
import { getCachedCategories, CacheService } from "./cacheService";

const getCategories = async () => {
  return await getCachedCategories(async () => {
    const res = await API.get("/categories");
    return res.data;
  });
};

const addCategory = async (name) => {
  const res = await API.post("/categories", { name });
  CacheService.clearPatterns.categoryOperation();
  return res.data;
};

const updateCategory = async (id, name) => {
  const res = await API.put(`/categories/${id}`, { name });
  CacheService.clearPatterns.categoryOperation();
  return res.data;
};

const deleteCategory = async (id) => {
  const res = await API.delete(`/categories/${id}`);
  CacheService.clearPatterns.categoryOperation();
  return res.data;
};

export default { getCategories, addCategory, updateCategory, deleteCategory };
