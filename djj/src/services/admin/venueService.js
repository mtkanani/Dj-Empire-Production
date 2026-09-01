import { api } from '../api.js';

export const venueService = {
  getVenues: async () => {
    try {
      return await api.get('/customer/venues');
    } catch {
      return { data: [] };
    }
  },
  getVenueById: (id) => api.get(`/admin/venues/${id}`),
  createVenue: (data) => api.post('/organizer/venues', data),
  updateVenue: (id, data) => api.put(`/admin/venues/${id}`, data),
  deleteVenue: (id) => api.delete(`/admin/venues/${id}`),
};
