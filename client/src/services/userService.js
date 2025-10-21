import API from "../api.js";

const updateProfile = async (profileData) => {
    const res = await API.put('/auth/profile', profileData);
    return res.data;
};

const changePassword = async (passwordData) => {
  try {
    const res = await API.put("/auth/password", passwordData);
    return res.data;
  } catch (error) {
    console.error("Password change error:", error);
    throw error;
  }
};

export default { updateProfile, changePassword };