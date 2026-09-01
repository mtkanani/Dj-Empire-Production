import { api } from '../api.js';

export const customerAccountService = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
};
