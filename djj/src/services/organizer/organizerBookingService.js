import { api } from '../api.js';

export const organizerBookingService = {
  // Get Organizer Event Bookings with pagination and filters
  getOrganizerBookings: (params = {}) => api.get('/organizer/bookings', { params }),

  // Get Organizer Booking Details by ID
  getOrganizerBookingById: (bookingId) => api.get(`/organizer/bookings/${bookingId}`),
};
