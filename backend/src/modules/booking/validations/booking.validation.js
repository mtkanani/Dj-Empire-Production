import { z } from 'zod';
import { isValidPhone, normalizePhone } from '../../../utils/phone.util.js';

const identityDocumentIdSchema = z
  .string()
  .optional()
  .transform((val) => (val && val.trim() ? val.trim() : undefined));

/**
 * Zod Validation Schemas for Customer Booking & Reservation Module
 */

const bookingItemSchema = z.object({
  ticketTypeId: z.string().min(1).optional(),
  sectionId: z.string().optional(),
  quantity: z.number().int().min(1).max(10),
  unitPrice: z.number().nonnegative().optional(),
  seatIds: z.array(z.string()).optional(),
});

const attendeeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(80, 'Full name is too long')
    .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, 'Enter a valid full name'),
  mobileNumber: z
    .string()
    .trim()
    .min(10, 'Mobile number is required')
    .max(20)
    .refine((val) => isValidPhone(val), { message: 'Enter a valid Indian mobile number' })
    .transform((val) => normalizePhone(val)),
  identityDocumentId: identityDocumentIdSchema,
});

const hasQuantity = (data) => {
  const itemQty = Array.isArray(data.items) ? data.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
  return (data.quantity && data.quantity >= 1) || itemQty >= 1;
};

const quantityFrom = (data) => {
  const itemQty = Array.isArray(data.items) ? data.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
  return itemQty || data.quantity || 0;
};

export const createReservationSchema = z
  .object({
    eventId: z.string().min(1, 'Event ID is required'),
    scheduleId: z.string().optional(),
    sectionId: z.string().optional(),
    ticketTypeId: z.string().optional(),
    quantity: z.number().int().min(1).max(10).optional(),
    seatIds: z.array(z.string()).optional(),
    items: z.array(bookingItemSchema).optional(),
  })
  .refine(hasQuantity, { message: 'Quantity must be at least 1', path: ['quantity'] });

export const createBookingSchema = z
  .object({
    eventId: z.string().min(1, 'Event ID is required'),
    scheduleId: z.string().optional(),
    sectionId: z.string().optional(),
    ticketTypeId: z.string().optional(),
    quantity: z.number().int().min(1).max(10).optional(),
    reservationNumber: z.string().optional(),
    reservationId: z.string().optional(),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
    paymentGateway: z.enum(['CASH', 'RAZORPAY']).optional(),
    items: z.array(bookingItemSchema).optional(),
    attendees: z.array(attendeeSchema).min(1, 'Attendee details are required for every ticket'),
  })
  .refine(hasQuantity, { message: 'Quantity must be at least 1', path: ['quantity'] })
  .refine((data) => data.attendees.length === quantityFrom(data), {
    message: 'Number of attendees must exactly match the number of tickets',
    path: ['attendees'],
  });

export const confirmBookingSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID / Payment Reference is required'),
  paymentMethod: z.string().default('CARD'),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().optional(),
});

export const overrideStatusSchema = z.object({
  bookingStatus: z.enum(['Pending', 'Reserved', 'AwaitingPayment', 'Confirmed', 'Cancelled', 'Expired', 'Refunded', 'CheckedIn']).optional(),
  paymentStatus: z.enum(['Pending', 'Authorized', 'Paid', 'CASH_RECEIVED', 'Failed', 'Cancelled', 'Refunded', 'PartiallyRefunded']).optional(),
  reason: z.string().min(1, 'Reason for manual override is required'),
});

export const cashLookupSchema = z.object({
  bookingNumber: z.string().min(1, 'Booking ID is required').optional(),
});

export const cashLookupQrSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
});
