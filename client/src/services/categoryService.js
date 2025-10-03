import API from "../api";

const getCategories = async () => {
  const res = await API.get("/categories");
  return res.data;
};

const addCategory = async (name) => {
  const res = await API.post("/categories", { name });
  return res.data;
};

const updateCategory = async (id, name) => {
  const res = await API.put(`/categories/${id}`, { name });
  return res.data;
};

const deleteCategory = async (id) => {
  const res = await API.delete(`/categories/${id}`);
  return res.data;
};

export default { getCategories, addCategory, updateCategory, deleteCategory };
