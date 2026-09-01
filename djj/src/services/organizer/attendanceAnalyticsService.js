import { api } from '../api.js';

export const attendanceAnalyticsService = {
  // Get Event Attendance Stats (Total, CheckedIn, Remaining, Occupancy %)
  getEventAttendance: (eventId) => api.get(`/events/${eventId}/attendance`),

  // Get Live Real-Time Attendance & Occupancy
  getLiveAttendance: (eventId) => api.get(`/events/${eventId}/live-attendance`),

  // Get Scan Audit History Logs
  getCheckInHistory: (eventId, params = {}) => api.get(`/events/${eventId}/checkin-history`, { params }),

  // Get Scanner Dashboard Metrics & Counter
  getScannerMetrics: (eventId) => api.get(`/organizer/events/${eventId}/dashboard/scanner-metrics`),
};
