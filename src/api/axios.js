import axios from 'axios';

const API = axios.create({
  baseURL: 'https://tfg-backend-production-bc6a.up.railway.app/api', // tu backend Laravel
});

// Si hay token guardado en localStorage, lo agrega automáticamente
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
