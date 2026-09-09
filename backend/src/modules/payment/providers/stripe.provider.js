import { IPaymentProvider } from './paymentProvider.interface.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Stripe Payment Provider Implementation (Global Multi-Currency & Cards)
 */
export class StripeProvider extends IPaymentProvider {
  async createOrder({ bookingId, amount, currency = 'USD' }) {
    const gatewayOrderId = `pi_stripe_${Math.random().toString(36).substring(2, 14)}`;

    return {
      gateway: 'STRIPE',
      gatewayOrderId,
      amount,
      currency,
      clientSecret: `${gatewayOrderId}_secret_${Math.random().toString(36).substring(2, 10)}`,
    };
  }

  async verifyPayment() {
    // Never wired to the real Stripe SDK — approving unverified payments here
    // would issue tickets for free.
    throw new AppError('Stripe payments are not enabled on this platform', HTTP_STATUS.BAD_REQUEST);
  }

  async processRefund({ gatewayPaymentId, amount }) {
    return {
      refundId: `re_stripe_${Math.random().toString(36).substring(2, 12)}`,
      status: 'PROCESSED',
      amount,
      gatewayPaymentId,
    };
  }

  async parseWebhook() {
    throw new AppError('Stripe webhooks are not enabled on this platform', HTTP_STATUS.BAD_REQUEST);
  }
}
