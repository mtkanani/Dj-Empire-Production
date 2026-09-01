import { api } from '../api.js';

export const categoryService = {
  getCategories: async () => {
    try {
      return await api.get('/customer/categories');
    } catch {
      try {
        return await api.get('/event-categories');
      } catch {
        return { data: [] };
      }
    }
  },
  getCategoryById: (id) => api.get(`/event-categories/${id}`),
  createCategory: (data) => api.post('/organizer/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};
