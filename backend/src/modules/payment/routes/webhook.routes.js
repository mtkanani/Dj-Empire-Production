import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';

const router = Router();

/**
 * Public Gateway Webhook Receivers
 *
 * Payloads are authenticated by gateway signature inside the provider, not by
 * JWT. The PayPal receiver was removed along with the PayPal payment method.
 */
router.post('/webhooks/razorpay', PaymentController.handleRazorpayWebhook);

export default router;
