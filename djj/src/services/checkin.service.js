import { axiosInstance } from '../api/axiosInstance.js';

const scannerAuthHeaders = () => {
  const scannerToken = localStorage.getItem('djj_scanner_token');
  return scannerToken ? { Authorization: `Bearer ${scannerToken}` } : {};
};

export const checkinService = {
  scannerLogin: async (credentials) => {
    return axiosInstance.post('/checkin/scanner/login', credentials);
  },
  scanQrCode: async (payload) => {
    return axiosInstance.post('/checkin/scan', payload, {
      headers: scannerAuthHeaders(),
    });
  },
  verifyTicket: async (payload) => {
    return axiosInstance.post('/tickets/verify', payload, {
      headers: scannerAuthHeaders(),
    });
  },
  manualCheckIn: async (payload) => {
    return axiosInstance.post('/checkin/manual', payload, {
      headers: scannerAuthHeaders(),
    });
  },
  createScannerAccount: async (eventId, scannerData) => {
    return axiosInstance.post(`/organizer/events/${eventId}/scanners`, scannerData);
  },
  getEventScanners: async (eventId) => {
    return axiosInstance.get(`/organizer/events/${eventId}/scanners`);
  },
  getDashboardScannerMetrics: async (eventId) => {
    return axiosInstance.get(`/organizer/events/${eventId}/dashboard/scanner-metrics`);
  },
};
