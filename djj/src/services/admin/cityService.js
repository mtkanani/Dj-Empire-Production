import { api } from '../api.js';

export const cityService = {
  getCities: async () => {
    try {
      return await api.get('/customer/cities');
    } catch {
      return { data: [] };
    }
  },
  getCityById: (id) => api.get(`/admin/cities/${id}`),
  createCity: (data) => api.post('/organizer/cities', data),
  updateCity: (id, data) => api.put(`/admin/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/admin/cities/${id}`),
};
