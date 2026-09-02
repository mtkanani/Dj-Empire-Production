import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage.js';
import { API_BASE_URL } from '../constants/theme.js';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request Interceptor: Attach Bearer Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (status === 401) {
      // Unauthorized or expired token -> clear local storage
      tokenStorage.clear();
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors || [],
    });
  }
);
