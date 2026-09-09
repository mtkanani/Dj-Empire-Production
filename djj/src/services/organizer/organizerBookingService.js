import { api } from '../api.js';

export const organizerBookingService = {
  getOrganizerBookings: (params = {}) => api.get('/organizer/bookings', { params }),
  getOrganizerBookingById: (bookingId) => api.get(`/organizer/bookings/${bookingId}`),
  lookupCashBooking: (bookingNumber) =>
    api.get('/admin/bookings/lookup', { params: { bookingNumber } }),
  lookupCashBookingQr: (qrToken) => api.post('/admin/bookings/lookup-qr', { qrToken }),
  verifyCash: (bookingNumber) => api.post(`/admin/bookings/${encodeURIComponent(bookingNumber)}/verify-cash`),
};
