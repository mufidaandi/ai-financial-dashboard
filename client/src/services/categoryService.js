import axios from "axios";
const API_URL = "http://localhost:3000/api/categories";

const getCategories = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

const addCategory = async (name) => {
  const res = await axios.post(API_URL, { name });
  return res.data;
};

const updateCategory = async (id, name) => {
  const res = await axios.put(`${API_URL}/${id}`, { name });
  return res.data;
};

const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

export default { getCategories, addCategory, updateCategory, deleteCategory };
