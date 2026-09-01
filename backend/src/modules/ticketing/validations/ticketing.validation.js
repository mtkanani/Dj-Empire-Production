import { z } from 'zod';

/**
 * Zod Validation Schemas for Ticketing & Event Operations Module
 */

// 1. Event Section Schema
export const createSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required (e.g. VIP, Platinum, Gold)').trim(),
  description: z.string().optional(),
  color: z.string().default('#3B82F6'),
  layoutType: z.string().optional().default('GRID'),
  displayOrder: z.number().int().default(0),
  capacity: z.number().int().positive('Capacity must be greater than 0'),
});

export const updateSectionSchema = createSectionSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// 2. Ticket Type Base Schema & Refinement Rule
const ticketTypeBaseObject = z.object({
  name: z.string().min(1, 'Ticket type name is required (e.g. Early Bird, Regular)').trim(),
  description: z.string().optional(),
  price: z.number().nonnegative('Price cannot be negative').default(0.0),
  currency: z.string().default('INR'),
  bookingFee: z.number().nonnegative().default(0.0),
  platformFee: z.number().nonnegative().default(0.0),
  serviceCharge: z.number().nonnegative().default(0.0),
  gstPercentage: z.number().nonnegative().default(18.0),
  quantityTotal: z.number().int().positive('Quantity must be greater than 0').default(100),
  sectionId: z.string().optional(),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
  minimumTickets: z.number().int().positive().default(1),
  maximumTickets: z.number().int().positive().default(10),
});

export const createTicketTypeSchema = ticketTypeBaseObject.refine(
  (data) => {
    if (data.minimumTickets && data.maximumTickets) {
      return data.maximumTickets >= data.minimumTickets;
    }
    return true;
  },
  {
    message: 'Maximum tickets must be greater than or equal to Minimum tickets',
    path: ['maximumTickets'],
  }
);

export const updateTicketTypeSchema = ticketTypeBaseObject.partial().extend({
  isActive: z.boolean().optional(),
});

// 3. Inventory Update Schema
export const updateInventorySchema = z.object({
  totalQuantity: z.number().int().nonnegative().optional(),
  blockedQuantity: z.number().int().nonnegative().optional(),
});

// 4. Dynamic Pricing Schema
export const createPricingSchema = z.object({
  ticketTypeId: z.string().optional(),
  pricingType: z.enum(['EARLY_BIRD', 'REGULAR', 'LAST_MINUTE', 'FLASH_SALE', 'WEEKEND', 'HOLIDAY']).default('REGULAR'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  price: z.number().nonnegative('Price cannot be negative'),
  priority: z.number().int().default(1),
});

// 5. Booking Rules Schema
export const createBookingRulesSchema = z.object({
  minimumTickets: z.number().int().positive().default(1),
  maximumTickets: z.number().int().positive().default(10),
  maxTicketsPerUser: z.number().int().positive().default(10),
  bookingOpens: z.string().optional(),
  bookingCloses: z.string().optional(),
  bookingCutoff: z.number().int().nonnegative().default(60),
  allowGuestBooking: z.boolean().default(false),
  requireLogin: z.boolean().default(true),
  requireOTP: z.boolean().default(false),
  requireIdProof: z.boolean().default(false),
});

// 6. Waitlist Schema
export const createWaitlistSchema = z.object({
  ticketTypeId: z.string().optional(),
  customerEmail: z.string().email('Invalid customer email address'),
});

// 7. Coupon Schema
export const createCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase().trim(),
  type: z.enum(['PERCENTAGE', 'FLAT_AMOUNT', 'BUY_X_GET_Y', 'STUDENT', 'CORPORATE', 'PROMO_CODE', 'REFERRAL_CODE']).default('PERCENTAGE'),
  value: z.number().positive('Discount value must be positive'),
  minimumAmount: z.number().nonnegative().default(0.0),
  maximumDiscount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().default(100),
  validFrom: z.string().optional(),
  validUntil: z.string().min(1, 'Expiration date is required'),
});

export const validateCouponQuerySchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase().trim(),
  orderAmount: z.number().positive('Order amount must be positive'),
});
