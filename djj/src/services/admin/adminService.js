import { api } from '../api.js';

export const adminService = {
  // Dashboard & Analytics Metrics
  getDashboardMetrics: async (params = {}) => {
    return api.get('/admin/dashboard', { params });
  },
  getEvents: async (params = {}) => {
    return api.get('/admin/events', { params });
  },
  approveEvent: async (eventId) => {
    return api.patch(`/events/${eventId}/approve`);
  },
  rejectEvent: async (eventId, reason) => {
    return api.patch(`/events/${eventId}/reject`, { reason });
  },

  // Organizer Management
  getOrganizers: async (params = {}) => {
    return api.get('/admin/organizers', { params });
  },
  getOrganizerById: async (id) => {
    return api.get(`/admin/organizers/${id}`);
  },
  approveOrganizer: async (id) => {
    return api.patch(`/admin/organizers/${id}/approve`);
  },
  rejectOrganizer: async (id, reason) => {
    return api.patch(`/admin/organizers/${id}/reject`, { reason });
  },
  suspendOrganizer: async (id) => {
    return api.patch(`/admin/organizers/${id}/suspend`);
  },

  // Customer Management
  getCustomers: async (params = {}) => {
    return api.get('/admin/customers', { params });
  },
  getCustomerById: async (id) => {
    return api.get(`/admin/customers/${id}`);
  },
  suspendCustomer: async (id) => {
    return api.patch(`/admin/customers/${id}/suspend`);
  },
  activateCustomer: async (id) => {
    return api.patch(`/admin/customers/${id}/activate`);
  },

  // Category CRUD
  getCategories: async () => {
    return api.get('/admin/categories');
  },
  createCategory: async (data) => {
    return api.post('/admin/categories', data);
  },
  updateCategory: async (id, data) => {
    return api.put(`/admin/categories/${id}`, data);
  },
  deleteCategory: async (id) => {
    return api.delete(`/admin/categories/${id}`);
  },

  // City CRUD
  getCities: async () => {
    return api.get('/admin/cities');
  },
  createCity: async (data) => {
    return api.post('/admin/cities', data);
  },
  updateCity: async (id, data) => {
    return api.put(`/admin/cities/${id}`, data);
  },
  deleteCity: async (id) => {
    return api.delete(`/admin/cities/${id}`);
  },

  // Venue CRUD
  getVenues: async () => {
    return api.get('/admin/venues');
  },
  createVenue: async (data) => {
    return api.post('/admin/venues', data);
  },
  updateVenue: async (id, data) => {
    return api.put(`/admin/venues/${id}`, data);
  },
  deleteVenue: async (id) => {
    return api.delete(`/admin/venues/${id}`);
  },

  // Tax Settings
  getTaxSettings: async () => {
    return api.get('/admin/tax-settings');
  },
  updateTaxSettings: async (settings) => {
    return api.post('/admin/tax-settings', settings);
  },

  // Platform-wide payments (all organizers / events)
  getPayments: async (params = {}) => {
    return api.get('/admin/payments', { params });
  },
};
