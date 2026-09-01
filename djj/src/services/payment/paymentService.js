import { razorpayAdapter } from './adapters/razorpayAdapter.js';
import { paypalAdapter } from './adapters/paypalAdapter.js';
import { stripeAdapter } from './adapters/stripeAdapter.js';
import { cashAdapter } from './adapters/cashAdapter.js';
import { bankTransferAdapter } from './adapters/bankTransferAdapter.js';
import { customerPaymentService } from '../customer/customerPaymentService.js';
import { customerBookingService } from '../customer/customerBookingService.js';

const adapters = {
  RAZORPAY: razorpayAdapter,
  PAYPAL: paypalAdapter,
  STRIPE: stripeAdapter,
  CASH: cashAdapter,
  BANK_TRANSFER: bankTransferAdapter,
};

export const paymentService = {
  getAdapter: (gateway = 'RAZORPAY') => {
    const adapter = adapters[gateway.toUpperCase()];
    if (!adapter) {
      throw new Error(`Unsupported payment gateway adapter [${gateway}]`);
    }
    return adapter;
  },

  createPaymentOrder: async (bookingId, gateway = 'RAZORPAY', currency = 'INR') => {
    const adapter = paymentService.getAdapter(gateway);
    return adapter.createOrder(bookingId, currency);
  },

  verifyPayment: async (gateway, verifyPayload) => {
    const adapter = paymentService.getAdapter(gateway);
    return adapter.verifyPayment(verifyPayload);
  },

  getPaymentDetails: async (paymentId) => {
    const res = await customerPaymentService.getPaymentById(paymentId);
    return res.data || res;
  },

  getInvoice: async (bookingId) => {
    const res = await customerPaymentService.getInvoice(bookingId);
    return res.data || res;
  },

  getPaymentHistory: async () => {
    const res = await customerBookingService.getMyBookings();
    return res.data || res;
  },
};
