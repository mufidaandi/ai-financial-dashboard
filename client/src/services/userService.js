import API from "../api.js";

const updateProfile = async (profileData) => {
  try {
    console.log("Sending profile data:", profileData);
    const res = await API.put("/auth/profile", profileData);
    console.log("Received response:", res);
    console.log("Response data:", res.data);
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    console.error("Error response:", error.response);
    throw error;
  }
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