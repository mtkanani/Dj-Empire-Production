import { IPaymentProvider } from './paymentProvider.interface.js';

/**
 * Cash Payment Provider Implementation (Offline Events)
 */
export class CashProvider extends IPaymentProvider {
  async createOrder({ bookingId, amount, currency = 'INR' }) {
    const gatewayOrderId = `CASH-ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      gateway: 'CASH',
      gatewayOrderId,
      amount,
      currency,
    };
  }

  async verifyPayment({ gatewayOrderId }) {
    return {
      verified: true,
      gatewayPaymentId: `CASH-REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      gatewayTransactionId: `CASH-TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
  }

  async processRefund({ amount }) {
    return {
      refundId: `CASH-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'PROCESSED',
      amount,
    };
  }

  async parseWebhook() {
    return { verified: true, eventType: 'CASH_PAID', status: 'Paid' };
  }
}
