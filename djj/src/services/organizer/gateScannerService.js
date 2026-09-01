import { api } from '../api.js';

export const gateScannerService = {
  // ==================== GATES APIs ====================
  getGates: (eventId) => api.get('/gates', { params: { eventId } }),
  createGate: (data) => api.post('/gates', data),
  updateGate: (gateId, data) => api.put(`/gates/${gateId}`, data),
  deleteGate: (gateId) => api.delete(`/gates/${gateId}`),

  // ==================== SCANNER DEVICES APIs ====================
  getDevices: (eventId) => api.get('/devices', { params: { eventId } }),
  registerDevice: (data) => api.post('/devices', data),
  deleteDevice: (deviceId) => api.delete(`/devices/${deviceId}`),

  // ==================== SCANNER STAFF ACCOUNTS APIs ====================
  getScanners: (eventId) => api.get(`/organizer/events/${eventId}/scanners`),
  createScanner: (eventId, data) => api.post(`/organizer/events/${eventId}/scanners`, data),
  updateScanner: (eventId, scannerId, data) => api.put(`/organizer/events/${eventId}/scanners/${scannerId}`, data),
  deleteScanner: (eventId, scannerId) => api.delete(`/organizer/events/${eventId}/scanners/${scannerId}`),
  getScannerMetrics: (eventId) => api.get(`/organizer/events/${eventId}/dashboard/scanner-metrics`),
  scannerLogin: (data) => api.post('/checkin/scanner/login', data),

  // ==================== ATTENDANCE & AUDIT HISTORY APIs ====================
  getAttendance: (eventId) => api.get(`/events/${eventId}/attendance`),
  getLiveAttendance: (eventId) => api.get(`/events/${eventId}/live-attendance`),
  getCheckInHistory: (eventId, params) => api.get(`/events/${eventId}/checkin-history`, { params }),
};
