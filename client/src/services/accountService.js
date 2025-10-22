import API from "../api.js";
import { CacheService, getCachedAccounts } from "./cacheService";

const getAccounts = async () => {
  return await getCachedAccounts(async () => {
    const res = await API.get("/accounts");
    return res.data;
  });
};

const addAccount = async (accountData) => {
  const res = await API.post("/accounts", accountData);
  CacheService.clearPatterns.accountOperation();
  return res.data;
};

const updateAccount = async (id, accountData) => {
  const res = await API.put(`/accounts/${id}`, accountData);
  CacheService.clearPatterns.accountOperation();
  return res.data;
};

const deleteAccount = async (id) => {
  const res = await API.delete(`/accounts/${id}`);
  CacheService.clearPatterns.accountOperation();
  return res.data;
};

export default { getAccounts, addAccount, updateAccount, deleteAccount };
