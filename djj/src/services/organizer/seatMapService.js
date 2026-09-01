import { api } from '../api.js';

export const seatMapService = {
  // Event Sections CRUD
  getSections: (eventId) => api.get(`/events/${eventId}/sections`),

  getSectionById: (eventId, sectionId) => api.get(`/events/${eventId}/sections/${sectionId}`),

  createSection: (eventId, data) => api.post(`/events/${eventId}/sections`, data),

  updateSection: (eventId, sectionId, data) => api.put(`/events/${eventId}/sections/${sectionId}`, data),

  deleteSection: (eventId, sectionId) => api.delete(`/events/${eventId}/sections/${sectionId}`),

  // Ticket Types under Section
  createSectionTicketType: (eventId, sectionId, data) =>
    api.post(`/events/${eventId}/sections/${sectionId}/ticket-types`, data),

  getSectionTicketTypes: (eventId, sectionId) =>
    api.get(`/events/${eventId}/sections/${sectionId}/ticket-types`),

  getSectionSeats: (eventId, sectionId) => api.get(`/events/${eventId}/sections/${sectionId}/seats`),

  // Live Occupancy & Availability
  getLiveAvailability: async (eventId) => {
    try {
      return await api.get(`/events/${eventId}/availability/live`);
    } catch {
      return api.get(`/ticketing/events/${eventId}/availability/live`);
    }
  },
};
