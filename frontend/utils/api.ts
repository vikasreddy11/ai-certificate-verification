import axios from 'axios';

// Determine API base URL
// Use process.env.NEXT_PUBLIC_API_URL if set;
// otherwise fallback to live Render backend in production and localhost:8000 in development.
const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (clean.endsWith('/api')) {
      clean = clean.slice(0, -4);
    }
    return clean;
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://certiverify-backend-rmvy.onrender.com';
  }

  return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
