import { IPaymentProvider } from './paymentProvider.interface.js';

/**
 * PayPal Payment Provider Implementation (USD, EUR, GBP, International Cards)
 */
export class PayPalProvider extends IPaymentProvider {
  async createOrder({ bookingId, amount, currency = 'USD' }) {
    const gatewayOrderId = `PAYPAL-ORDER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return {
      gateway: 'PAYPAL',
      gatewayOrderId,
      amount,
      currency,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${gatewayOrderId}`,
    };
  }

  async verifyPayment({ gatewayOrderId, gatewayPaymentId }) {
    return {
      verified: true,
      gatewayPaymentId: gatewayPaymentId || `PAYPAL-PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      gatewayTransactionId: `PAYPAL-TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
  }

  async processRefund({ gatewayPaymentId, amount }) {
    return {
      refundId: `PAYPAL-REFUND-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: 'PROCESSED',
      amount,
      gatewayPaymentId,
    };
  }

  async parseWebhook(webhookPayload) {
    const eventType = webhookPayload.event_type || 'PAYMENT.CAPTURE.COMPLETED';

    return {
      verified: true,
      eventType,
      gatewayOrderId: webhookPayload.resource?.supplementary_data?.related_ids?.order_id || webhookPayload.gatewayOrderId,
      gatewayPaymentId: webhookPayload.resource?.id || webhookPayload.gatewayPaymentId,
      status: eventType === 'PAYMENT.CAPTURE.COMPLETED' ? 'Paid' : 'Failed',
    };
  }
}
