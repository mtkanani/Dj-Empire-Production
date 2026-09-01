import { z } from 'zod';

/**
 * Zod Validation Schemas for Event Organizer Module
 */

// 1. Organizer Profile Update Schema
export const updateOrganizerProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').trim().optional(),
  businessRegistrationNumber: z.string().optional(),
  phone: z.string().min(1, 'Mobile number is required').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
});

// 2. Event Creation Schema
export const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').trim(),
  slug: z.string().optional(),
  description: z.string().optional(),
  bannerUrl: z.string().url('Invalid banner image URL').optional().or(z.literal('')),
  categoryId: z.string().optional(),
  cityId: z.string().optional(),
  venueId: z.string().optional(),
  price: z.number().nonnegative('Price cannot be negative').default(0.0),
  startDate: z.string().datetime().optional().or(z.string().min(1)),
  endDate: z.string().datetime().optional().or(z.string().min(1)),
});

// 3. Event Update Schema
export const updateEventSchema = createEventSchema.partial();

// 4. Ticket Type Creation Schema
export const createTicketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name is required (e.g. VIP, General Admission)').trim(),
  description: z.string().optional(),
  price: z.number().nonnegative('Price cannot be negative').default(0.0),
  quantityTotal: z.number().int().positive('Quantity must be greater than 0').default(100),
  sectionId: z.string().min(1, 'Assign this ticket to a section (Gold, VIP, Silver, etc.)').optional(),
  pricingType: z.string().optional(),
});

// 5. Ticket Type Update Schema
export const updateTicketTypeSchema = createTicketTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// 6. QR Check-In Verification Schema
export const checkInSchema = z.object({
  ticketCode: z.string().min(1, 'Ticket code / QR payload is required').trim(),
});
