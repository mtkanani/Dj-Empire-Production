import { customerPaymentService } from '../../customer/customerPaymentService.js';

export const stripeAdapter = {
  createOrder: async (bookingId, currency) => {
    const res = await customerPaymentService.createPaymentOrder({
      bookingId,
      gateway: 'STRIPE',
      currency: currency || 'USD',
    });
    return res.data || res;
  },

  verifyPayment: async (verifyPayload) => {
    const res = await customerPaymentService.verifyPayment(verifyPayload);
    return res.data || res;
  },
};
