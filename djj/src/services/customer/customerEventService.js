import { api } from '../api.js';

export const customerEventService = {
  // Browse & Search Published Events
  browseEvents: (params = {}) => api.get('/customer/events', { params }),

  // Get Single Public Event Details
  getEventDetails: (id) => api.get(`/customer/events/${id}`),

  // Master Categories for Filtering
  getCategories: () => api.get('/customer/categories'),

  // Master Cities for Filtering
  getCities: () => api.get('/customer/cities'),
};
