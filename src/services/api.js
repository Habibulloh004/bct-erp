// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // cookie-based sessiya ishlatsangiz true; aks holda false qilishingiz mumkin
  timeout: 20000,
});

// Hech qanday token tekshiruvi yoki refresh yo‘q.
// (ixtiyoriy) response unwrappingni xohlasangiz quyidagini `res => res.data`ga o'zgartiring.
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export default api;
