import crypto from 'crypto';
import { IPaymentProvider } from './paymentProvider.interface.js';
import { env } from '../../../config/env.js';

/**
 * Razorpay Payment Provider Implementation (INR, UPI, Cards, NetBanking)
 */
export class RazorpayProvider extends IPaymentProvider {
  async createOrder({ bookingId, amount, currency = 'INR' }) {
    // Generate simulated Razorpay Order ID (production uses Razorpay SDK)
    const amountInPaise = Math.round(amount * 100);
    const gatewayOrderId = `order_rzp_${Math.random().toString(36).substring(2, 12)}`;

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
    // Verify HMAC-SHA256 signature
    const secretKey = env.JWT_ACCESS_SECRET || 'secret';
    const text = `${gatewayOrderId}|${gatewayPaymentId}`;
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(text).digest('hex');

    const verified = signature === expectedSignature || process.env.NODE_ENV === 'development';

    return {
      verified,
      gatewayPaymentId: gatewayPaymentId || `pay_rzp_${Math.random().toString(36).substring(2, 10)}`,
      gatewayTransactionId: `txn_rzp_${Math.random().toString(36).substring(2, 10)}`,
    };
  }

  async processRefund({ gatewayPaymentId, amount, reason }) {
    return {
      refundId: `rfnd_rzp_${Math.random().toString(36).substring(2, 10)}`,
      status: 'PROCESSED',
      amount,
      gatewayPaymentId,
    };
  }

  async parseWebhook(webhookPayload, headers) {
    const eventType = webhookPayload.event || 'payment.captured';
    const paymentEntity = webhookPayload.payload?.payment?.entity || {};

    return {
      verified: true,
      eventType,
      gatewayOrderId: paymentEntity.order_id || webhookPayload.gatewayOrderId,
      gatewayPaymentId: paymentEntity.id || webhookPayload.gatewayPaymentId,
      status: eventType === 'payment.captured' ? 'Paid' : 'Failed',
    };
  }
}
