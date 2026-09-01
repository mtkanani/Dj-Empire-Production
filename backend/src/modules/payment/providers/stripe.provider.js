import { IPaymentProvider } from './paymentProvider.interface.js';

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

  async verifyPayment({ gatewayOrderId, gatewayPaymentId }) {
    return {
      verified: true,
      gatewayPaymentId: gatewayPaymentId || `ch_stripe_${Math.random().toString(36).substring(2, 12)}`,
      gatewayTransactionId: `txn_stripe_${Math.random().toString(36).substring(2, 12)}`,
    };
  }

  async processRefund({ gatewayPaymentId, amount }) {
    return {
      refundId: `re_stripe_${Math.random().toString(36).substring(2, 12)}`,
      status: 'PROCESSED',
      amount,
      gatewayPaymentId,
    };
  }

  async parseWebhook(webhookPayload) {
    const eventType = webhookPayload.type || 'payment_intent.succeeded';
    return {
      verified: true,
      eventType,
      gatewayOrderId: webhookPayload.data?.object?.id || webhookPayload.gatewayOrderId,
      gatewayPaymentId: webhookPayload.data?.object?.latest_charge || webhookPayload.gatewayPaymentId,
      status: eventType === 'payment_intent.succeeded' ? 'Paid' : 'Failed',
    };
  }
}
