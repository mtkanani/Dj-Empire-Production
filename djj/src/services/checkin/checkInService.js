import { api } from '../api.js';

export const checkInService = {
  // Validate QR Code Payload without marking attendance
  validateQr: (data) => api.post('/checkin/validate', data),

  // Scan QR Code & Execute Check-In Entrance Access Control
  scanEntry: (data) => api.post('/checkin/scan', data),

  // Manual Check-In by Booking Number / Ticket Code
  manualCheckIn: (data) => api.post('/checkin/manual', data),

  // Revoke Check-In
  revokeCheckIn: (bookingId) => api.patch(`/checkin/revoke/${bookingId}`),

  // Verify Ticket Code
  verifyTicket: (data) => api.post('/organizer/check-in/verify', data),

  // Mark Attendance
  markAttendance: (data) => api.post('/organizer/check-in/mark-attendance', data),

  // Get Organizer Attendance Stats
  getAttendance: (eventId) => api.get(`/events/${eventId}/attendance`),

  // Get Organizer Event Gates
  getGates: (eventId) => api.get('/gates', { params: { eventId } }),
};
