import { IPaymentProvider } from './paymentProvider.interface.js';

/**
 * Bank Transfer Payment Provider Implementation (Manual Verification)
 */
export class BankTransferProvider extends IPaymentProvider {
  async createOrder({ bookingId, amount, currency = 'INR' }) {
    const gatewayOrderId = `BANK-ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      gateway: 'BANK_TRANSFER',
      gatewayOrderId,
      amount,
      currency,
      bankAccountDetails: {
        accountName: 'Event Booking Platform Pvt Ltd',
        accountNumber: '998877665544',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
      },
    };
  }

  async verifyPayment({ gatewayOrderId }) {
    return {
      verified: true,
      gatewayPaymentId: `BANK-REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      gatewayTransactionId: `BANK-TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
  }

  async processRefund({ amount }) {
    return {
      refundId: `BANK-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'PROCESSED',
      amount,
    };
  }

  async parseWebhook() {
    return { verified: true, eventType: 'BANK_PAID', status: 'Paid' };
  }
}
