import { api } from '../api.js';

export const customerPaymentService = {
  // Gateway Payment Order Creation (Strategy Pattern)
  createPaymentOrder: (data) => api.post('/payments/create-order', data),

  // Verify Signature & Confirm Booking
  verifyPayment: (data) => api.post('/payments/verify', data),

  // Get Payment Details
  getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),

  // Get Tax Invoice
  getInvoice: (bookingId) => api.get(`/invoices/${bookingId}`),
};
