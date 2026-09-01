import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';

const router = Router();

/**
 * Public Gateway Webhook Receivers
 */
router.post('/webhooks/razorpay', PaymentController.handleRazorpayWebhook);
router.post('/webhooks/paypal', PaymentController.handlePayPalWebhook);

export default router;
