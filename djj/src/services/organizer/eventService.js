import { api } from '../api.js';

export const eventService = {
  // Core Event CRUD & Listing
  getEvents: (params = {}) => api.get('/events', { params }),

  getOrganizerEvents: () => api.get('/organizer/events'),
  getMyEvents: (params = {}) => api.get('/organizer/events', { params }),

  getEventById: async (id) => {
    try {
      return await api.get(`/organizer/events/${id}`);
    } catch {
      return api.get(`/events/${id}`);
    }
  },

  createEvent: (data) => api.post('/events', data),

  updateEvent: (id, data) => api.put(`/events/${id}`, data),

  deleteEvent: async (id) => {
    try {
      return await api.delete(`/organizer/events/${id}`);
    } catch {
      return api.delete(`/events/${id}`);
    }
  },

  // Finite State Machine Transitions
  submitForApproval: (id) => api.patch(`/events/${id}/submit-approval`),

  publishEvent: (id) => api.patch(`/events/${id}/publish`),

  unpublishEvent: (id) => api.patch(`/events/${id}/unpublish`),

  cancelEvent: (id) => api.patch(`/events/${id}/cancel`),

  archiveEvent: (id) => api.patch(`/events/${id}/archive`),

  // Sub-resource: Schedules
  getSchedules: (eventId) => api.get(`/events/${eventId}/schedules`),
  addSchedule: (eventId, data) => api.post(`/events/${eventId}/schedules`, data),
  updateSchedule: (id, data) => api.put(`/events/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/events/schedules/${id}`),

  // Sub-resource: Venue Location Details
  getVenue: (eventId) => api.get(`/events/${eventId}/venue`),
  upsertVenue: (eventId, data) => api.post(`/events/${eventId}/venue`, data),
  deleteVenue: (eventId) => api.delete(`/events/${eventId}/venue`),

  // Sub-resource: Images & Banners
  getImages: (eventId) => api.get(`/events/${eventId}/images`),
  addImage: (eventId, data) => api.post(`/events/${eventId}/images`, data),
  updateImage: (id, data) => api.put(`/events/images/${id}`, data),
  deleteImage: (id) => api.delete(`/events/images/${id}`),

  // Sub-resource: FAQs
  getFAQs: (eventId) => api.get(`/events/${eventId}/faqs`),
  addFAQ: (eventId, data) => api.post(`/events/${eventId}/faqs`, data),
  updateFAQ: (id, data) => api.put(`/events/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/events/faqs/${id}`),

  // Sub-resource: Policy
  getPolicy: (eventId) => api.get(`/events/${eventId}/policy`),
  upsertPolicy: (eventId, data) => api.post(`/events/${eventId}/policy`, data),

  // Sub-resource: SEO
  getSEO: (eventId) => api.get(`/events/${eventId}/seo`),
  upsertSEO: (eventId, data) => api.post(`/events/${eventId}/seo`, data),
};
