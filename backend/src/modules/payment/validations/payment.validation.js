import { z } from 'zod';

/**
 * Zod Validation Schemas for Payment & Financial Management Module
 */

const SUPPORTED_CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'AED',
  'SAR', 'JPY', 'CNY', 'HKD', 'MYR', 'THB', 'NZD', 'CHF',
  'SEK', 'NOK', 'DKK', 'ZAR'
];

// 1. Create Payment Order Schema
export const createPaymentOrderSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  gateway: z.enum(['RAZORPAY', 'PAYPAL', 'STRIPE', 'CASH', 'BANK_TRANSFER']).optional(),
  currency: z.string().toUpperCase().refine((val) => SUPPORTED_CURRENCIES.includes(val), {
    message: `Unsupported currency code. Must be one of: [${SUPPORTED_CURRENCIES.join(', ')}]`,
  }).default('INR'),
});

// 2. Verify Payment Signature Schema
export const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  gatewayOrderId: z.string().optional(),
  gatewayPaymentId: z.string().optional(),
  signature: z.string().optional(),
});

// 3. Process Refund Schema
export const createRefundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  refundAmount: z.number().positive('Refund amount must be greater than 0'),
  reason: z.string().optional(),
});
