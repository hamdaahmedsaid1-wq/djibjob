import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajouter automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("djibjob_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion globale des réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "Session expirée ou utilisateur non autorisé."
      );
    }

    return Promise.reject(error);
  }
);

export default api;