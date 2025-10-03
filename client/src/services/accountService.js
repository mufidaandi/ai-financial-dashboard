import API from "../api.js";

const getAccounts = async () => {
  const res = await API.get("/accounts");
  return res.data;
};

const addAccount = async (accountData) => {
  const res = await API.post("/accounts", accountData);
  return res.data;
};

const updateAccount = async (id, accountData) => {
  const res = await API.put(`/accounts/${id}`, accountData);
  return res.data;
};

const deleteAccount = async (id) => {
  const res = await API.delete(`/accounts/${id}`);
  return res.data;
};

export default { getAccounts, addAccount, updateAccount, deleteAccount };
