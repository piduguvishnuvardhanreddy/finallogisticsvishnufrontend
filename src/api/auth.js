import axios from "axios";

const API_BASE = "https://finallogisticsvishnubackend.onrender.com/api/auth";

export const registerUser = (data) => axios.post(`${API_BASE}/register`, data);
export const loginUser = (data) => axios.post(`${API_BASE}/login`, data);
export const getProfile = (token) =>
  axios.get(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
