import { customerPaymentService } from '../../customer/customerPaymentService.js';

export const paypalAdapter = {
  createOrder: async (bookingId, currency) => {
    const res = await customerPaymentService.createPaymentOrder({
      bookingId,
      gateway: 'PAYPAL',
      currency: currency || 'USD',
    });
    return res.data || res;
  },

  verifyPayment: async (verifyPayload) => {
    const res = await customerPaymentService.verifyPayment(verifyPayload);
    return res.data || res;
  },
};
