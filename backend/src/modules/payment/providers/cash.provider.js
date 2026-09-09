import { IPaymentProvider } from './paymentProvider.interface.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Cash Payment Provider Implementation (Offline Events)
 *
 * Cash is settled in person, so it has no gateway callback to verify. A cash
 * booking may only be marked paid by an authorised SUPER_ADMIN / EVENT_ORGANIZER
 * through CashVerificationService, never through the customer-facing
 * POST /payments/verify route.
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

  async verifyPayment() {
    throw new AppError(
      'Cash payments cannot be self-verified. An authorised administrator or organizer must confirm the cash was physically received.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  async processRefund({ amount }) {
    return {
      refundId: `CASH-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'PROCESSED',
      amount,
    };
  }

  async parseWebhook() {
    throw new AppError('Cash payments do not support webhook confirmation', HTTP_STATUS.FORBIDDEN);
  }
}
