import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { RefundController } from '../controllers/refund.controller.js';
import { InvoiceController } from '../controllers/invoice.controller.js';
import { SettlementController } from '../controllers/settlement.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  createRefundSchema,
} from '../validations/payment.validation.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Payment Gateway & Financial Management Module
 *   description: Strategy Pattern Multi-Gateway Payment Engine, Refunds, Tax Invoices & Settlements
 */

// Public / Guest Tax Invoice View
router.get('/invoices/:bookingId', InvoiceController.getInvoice);

// Protect all mutating & transactional endpoints with JWT Authentication
router.use(authenticate);

// ==================== PAYMENTS ====================
/**
 * @openapi
 * /payments/create-order:
 *   post:
 *     summary: Create Gateway Payment Order (Strategy Pattern)
 *     tags: [Payment Gateway & Financial Management Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId]
 *             properties:
 *               bookingId: { type: string }
 *               gateway: { type: string, enum: [RAZORPAY, PAYPAL, STRIPE, CASH, BANK_TRANSFER], example: RAZORPAY }
 *               currency: { type: string, example: INR }
 *     responses:
 *       201:
 *         description: Payment order created
 */
router.post('/payments/create-order', validate(createPaymentOrderSchema), PaymentController.createPaymentOrder);

/**
 * @openapi
 * /payments/verify:
 *   post:
 *     summary: Verify Gateway Payment Signature & Confirm Booking
 *     tags: [Payment Gateway & Financial Management Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId]
 *             properties:
 *               paymentId: { type: string }
 *               gatewayOrderId: { type: string }
 *               gatewayPaymentId: { type: string }
 *               signature: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified and booking confirmed
 */
router.post('/payments/verify', validate(verifyPaymentSchema), PaymentController.verifyPayment);
router.get('/payments/:paymentId', PaymentController.getPaymentById);

// ==================== ORGANIZER PAYMENTS ====================
router.get('/organizer/payments', authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'), PaymentController.getOrganizerPayments);

// ==================== REFUNDS ====================
router.post('/refunds', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createRefundSchema), RefundController.processRefund);
router.get('/organizer/refunds', authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'), RefundController.getOrganizerRefunds);

// ==================== SETTLEMENTS ====================
router.get('/organizer/settlements', authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'), SettlementController.getSettlements);

export default router;
