// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  //baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, 
  baseURL: `http://localhost:5000/api`,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
