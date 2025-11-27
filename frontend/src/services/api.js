import axios from 'axios';

import { API_BASE_URL } from '../config/api.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get auth token from Firebase if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we're not already on a public page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      // Don't redirect on homepage or public pages
      if (window.location.pathname !== '/' && !window.location.pathname.includes('/categories')) {
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

