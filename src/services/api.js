import axios from 'axios';

// This is the ONE place our whole app knows where the backend lives
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach the login "wristband" (token) to every request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vantara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;