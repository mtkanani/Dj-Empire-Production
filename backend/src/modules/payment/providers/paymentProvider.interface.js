/**
 * Abstract Payment Provider Strategy Interface
 * Standardized contract that all payment gateway providers (Razorpay, PayPal, Stripe, Cash, BankTransfer) must implement.
 */
export class IPaymentProvider {
  /**
   * Create Gateway Payment Order
   * @param {Object} paymentData - { bookingId, amount, currency, customerEmail }
   * @returns {Promise<Object>} - { gatewayOrderId, gateway, amount, currency, rawResponse }
   */
  async createOrder(paymentData) {
    throw new Error('createOrder() method must be implemented by payment provider');
  }

  /**
   * Verify Gateway Payment Signature / Callback Response
   * @param {Object} verificationData - Gateway payload and HMAC signature
   * @returns {Promise<Object>} - { verified: boolean, gatewayPaymentId, gatewayTransactionId }
   */
  async verifyPayment(verificationData) {
    throw new Error('verifyPayment() method must be implemented by payment provider');
  }

  /**
   * Process Gateway Refund
   * @param {Object} refundData - { gatewayPaymentId, amount, reason }
   * @returns {Promise<Object>} - { refundId, status, amount }
   */
  async processRefund(refundData) {
    throw new Error('processRefund() method must be implemented by payment provider');
  }

  /**
   * Parse & Verify Gateway Webhook Payload
   * @param {Object} webhookPayload - Raw request body
   * @param {Object} headers - Request headers for HMAC verification
   * @returns {Promise<Object>} - { verified: boolean, eventType, paymentId, bookingId, status }
   */
  async parseWebhook(webhookPayload, headers) {
    throw new Error('parseWebhook() method must be implemented by payment provider');
  }
}
