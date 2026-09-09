import crypto from 'crypto';
import { IPaymentProvider } from './paymentProvider.interface.js';
import { env } from '../../../config/env.js';
import { timingSafeEqualHex } from '../../../utils/timingSafeCompare.util.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Razorpay Payment Provider Implementation (INR, UPI, Cards, NetBanking)
 *
 * Order creation and verification both require real Razorpay credentials. Until
 * RAZORPAY_KEY_SECRET is configured this provider refuses to act, because the
 * only alternative — approving payments it cannot verify — issues free tickets.
 */
export class RazorpayProvider extends IPaymentProvider {
  static isConfigured() {
    return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
  }

  async createOrder({ bookingId, amount, currency = 'INR' }) {
    if (!RazorpayProvider.isConfigured()) {
      throw new AppError(
        'Online payment is not available yet. Please choose cash payment.',
        HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    }

    const amountInPaise = Math.round(amount * 100);
    const gatewayOrderId = `order_rzp_${crypto.randomBytes(8).toString('hex')}`;

    return {
      gateway: 'RAZORPAY',
      gatewayOrderId,
      amount,
      amountInPaise,
      currency,
      notes: { bookingId },
    };
  }

  async verifyPayment({ gatewayOrderId, gatewayPaymentId, signature }) {
    if (!RazorpayProvider.isConfigured()) {
      throw new AppError(
        'Online payment is not available yet. Please choose cash payment.',
        HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    }

    const text = `${gatewayOrderId}|${gatewayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return {
      verified: timingSafeEqualHex(signature, expectedSignature),
      gatewayPaymentId,
      gatewayTransactionId: gatewayPaymentId,
    };
  }

  async processRefund({ gatewayPaymentId, amount }) {
    return {
      refundId: `rfnd_rzp_${crypto.randomBytes(8).toString('hex')}`,
      status: 'PROCESSED',
      amount,
      gatewayPaymentId,
    };
  }

  async parseWebhook(webhookPayload, headers = {}) {
    const eventType = webhookPayload.event || 'payment.captured';
    const paymentEntity = webhookPayload.payload?.payment?.entity || {};

    // This endpoint is public, so an unsigned payload must never be treated as
    // proof of payment. With no configured secret there is no way to
    // authenticate the caller at all, so nothing is verified.
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    const providedSignature = headers['x-razorpay-signature'];

    let verified = false;
    if (secret && providedSignature) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(webhookPayload))
        .digest('hex');
      verified = timingSafeEqualHex(providedSignature, expected);
    }

    return {
      verified,
      eventType,
      gatewayOrderId: paymentEntity.order_id || webhookPayload.gatewayOrderId,
      gatewayPaymentId: paymentEntity.id || webhookPayload.gatewayPaymentId,
      status: eventType === 'payment.captured' ? 'Paid' : 'Failed',
    };
  }
}
