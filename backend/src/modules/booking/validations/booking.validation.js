import { z } from 'zod';

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

const hasQuantity = (data) => {
  const itemQty = Array.isArray(data.items) ? data.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
  return (data.quantity && data.quantity >= 1) || itemQty >= 1;
};

// 1. Create 15-Minute Reservation Lock Schema
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

// 2. Create Booking Schema
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
    items: z.array(bookingItemSchema).optional(),
  })
  .refine(hasQuantity, { message: 'Quantity must be at least 1', path: ['quantity'] });

// 3. Confirm Booking Schema
export const confirmBookingSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID / Payment Reference is required'),
  paymentMethod: z.string().default('CARD'),
});

// 4. Cancel Booking Schema
export const cancelBookingSchema = z.object({
  cancellationReason: z.string().optional(),
});

// 5. Admin Override Status Schema
export const overrideStatusSchema = z.object({
  bookingStatus: z.enum(['Pending', 'Reserved', 'AwaitingPayment', 'Confirmed', 'Cancelled', 'Expired', 'Refunded', 'CheckedIn']).optional(),
  paymentStatus: z.enum(['Pending', 'Authorized', 'Paid', 'Failed', 'Cancelled', 'Refunded', 'PartiallyRefunded']).optional(),
  reason: z.string().min(1, 'Reason for manual override is required'),
});
