// src/utils/authUtils.js
import { jwtDecode } from "jwt-decode";


export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds
    return decoded.exp < currentTime;
  } catch (err) {
    return true; // invalid token
  }
};
