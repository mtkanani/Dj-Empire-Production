import { api } from '../api.js';

export const financialService = {
  // ==================== PAYMENTS APIs ====================
  getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),
  createPaymentOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),

  // ==================== REFUNDS APIs ====================
  processRefund: (data) => api.post('/refunds', data),
  getOrganizerPayments: (params = {}) => api.get('/organizer/payments', { params }),
  getOrganizerRefunds: (params = {}) => api.get('/organizer/refunds', { params }),

  // ==================== INVOICES APIs ====================
  getInvoiceByBooking: (bookingId) => api.get(`/invoices/${bookingId}`),

  // ==================== SETTLEMENTS APIs ====================
  getSettlements: () => api.get('/organizer/settlements'),
};
