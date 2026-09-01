import { axiosInstance } from '../api/axiosInstance.js';

export const authService = {
  login: async (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },
  getMe: async () => {
    return axiosInstance.get('/auth/me');
  },
};
