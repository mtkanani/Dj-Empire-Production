import { api } from '../api.js';

export const customerBookingService = {
  // 15-Minute Reservation Inventory Lock
  createReservation: (data) => api.post('/reservations', data),

  getReservation: (id) => api.get(`/reservations/${id}`),

  cancelReservation: (id) => api.delete(`/reservations/${id}`),

  // Booking Operations
  createBooking: (data) => api.post('/bookings', data),

  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),

  confirmBooking: (bookingId, data) => api.patch(`/bookings/${bookingId}/confirm`, data),

  cancelBooking: (bookingId, data) => api.patch(`/bookings/${bookingId}/cancel`, data),

  getBookingItems: (bookingId) => api.get(`/bookings/${bookingId}/items`),

  // Customer My Bookings
  getMyBookings: (params) => api.get('/my-bookings', { params }),

  getMyBookingById: (bookingId) => api.get(`/my-bookings/${bookingId}`),

  getBookingTicket: (bookingId) => api.get(`/bookings/${bookingId}/ticket`),

  downloadTicketPdf: (bookingId) =>
    api.get(`/bookings/${bookingId}/ticket/download`, { responseType: 'blob', timeout: 60000 }),

  resendTicketEmail: (bookingId) => api.post(`/bookings/${bookingId}/ticket/resend`),

  // QR Ticket
  getQrTicket: (bookingId, ticketId) => api.get(`/bookings/${bookingId}/tickets/${ticketId}/qr`),
};
