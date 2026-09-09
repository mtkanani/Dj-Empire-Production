import { IPaymentProvider } from './paymentProvider.interface.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

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

  async verifyPayment() {
    // Bank transfers settle out of band and must be confirmed by staff, never by
    // the paying customer.
    throw new AppError(
      'Bank transfers cannot be self-verified. An authorised administrator must confirm receipt of funds.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  async processRefund({ amount }) {
    return {
      refundId: `BANK-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'PROCESSED',
      amount,
    };
  }

  async parseWebhook() {
    throw new AppError('Bank transfers do not support webhook confirmation', HTTP_STATUS.FORBIDDEN);
  }
}
