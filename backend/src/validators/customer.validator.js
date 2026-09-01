import { z } from 'zod';
import { isValidPhone } from '../utils/phone.util.js';

/**
 * Zod Validation Schemas for Customer Module
 */

// 1. Customer Profile Update Schema
export const updateCustomerProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim().optional(),
  lastName: z.string().min(1, 'Last name is required').trim().optional(),
  phone: z
    .string()
    .min(1, 'Mobile number is required')
    .refine(isValidPhone, 'Enter a valid mobile number (10–15 digits)')
    .optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
});

// 2. Change Password Schema
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

// 3. Create Booking Schema
export const createBookingSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  tickets: z
    .array(
      z.object({
        ticketTypeId: z.string().min(1, 'Ticket Type ID is required'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one ticket must be selected'),
});

// 4. Wishlist Schema
export const addWishlistSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
});

// 5. Review Creation Schema
export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});

// 6. Review Update Schema
export const updateReviewSchema = createReviewSchema.partial();
