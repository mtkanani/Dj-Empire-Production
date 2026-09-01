import { customerPaymentService } from '../../customer/customerPaymentService.js';

export const cashAdapter = {
  createOrder: async (bookingId, currency) => {
    const res = await customerPaymentService.createPaymentOrder({
      bookingId,
      gateway: 'CASH',
      currency: currency || 'INR',
    });
    return res.data || res;
  },

  verifyPayment: async (verifyPayload) => {
    const res = await customerPaymentService.verifyPayment(verifyPayload);
    return res.data || res;
  },
};
