import { IPaymentProvider } from './paymentProvider.interface.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * PayPal Payment Provider — RETIRED.
 *
 * PayPal was never wired to the real PayPal SDK; createOrder/verifyPayment were
 * stubs that approved every payment. New PayPal orders are refused. The class is
 * retained only so refunds against historical PAYPAL payment rows still resolve
 * a provider.
 */
export class PayPalProvider extends IPaymentProvider {
  async createOrder() {
    throw new AppError('PayPal is no longer an accepted payment method', HTTP_STATUS.BAD_REQUEST);
  }

  async verifyPayment() {
    throw new AppError('PayPal is no longer an accepted payment method', HTTP_STATUS.BAD_REQUEST);
  }

  async processRefund({ gatewayPaymentId, amount }) {
    return {
      refundId: `PAYPAL-REFUND-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: 'PROCESSED',
      amount,
      gatewayPaymentId,
    };
  }

  async parseWebhook() {
    throw new AppError('PayPal webhooks are no longer accepted', HTTP_STATUS.BAD_REQUEST);
  }
}
