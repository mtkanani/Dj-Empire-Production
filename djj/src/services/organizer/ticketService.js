import { api } from '../api.js';

export const ticketService = {
  // Ticket Type CRUD (Organizer Module)
  getEventTickets: (eventId) => api.get(`/organizer/events/${eventId}/tickets`),

  createTicket: (eventId, data) => api.post(`/organizer/events/${eventId}/tickets`, data),

  updateTicket: (ticketId, data) => api.put(`/organizer/tickets/${ticketId}`, data),

  deleteTicket: (ticketId) => api.delete(`/organizer/tickets/${ticketId}`),

  // Live Inventory & Occupancy (Ticketing Module)
  getLiveAvailability: async (eventId) => {
    try {
      return await api.get(`/events/${eventId}/availability/live`);
    } catch {
      return api.get(`/ticketing/events/${eventId}/availability/live`);
    }
  },

  getInventory: async (eventId) => {
    try {
      return await api.get(`/events/${eventId}/inventory`);
    } catch {
      return api.get(`/ticketing/events/${eventId}/inventory`);
    }
  },

  getTicketingDashboard: async (eventId) => {
    try {
      return await api.get(`/events/${eventId}/analytics/dashboard`);
    } catch {
      return api.get(`/ticketing/events/${eventId}/analytics/dashboard`);
    }
  },
};
