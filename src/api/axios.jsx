import axios from "axios";

const API = axios.create({
  baseURL: "https://tfg-backend-production-bc6a.up.railway.app/api",
  headers: {
    "Accept": "application/json",
  },
});

// Agregar token automáticamente
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo de errores global (ej: token expirado)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si backend devuelve 401 => cerrar sesión automáticamente
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;
