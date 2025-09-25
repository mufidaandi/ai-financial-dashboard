import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3000/api" });

// attach token automatically
API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

export default API;
