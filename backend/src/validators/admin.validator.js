import { z } from 'zod';

/**
 * Zod Validation Schemas for Super Admin Module
 */

// Category Validation Schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// City Validation Schemas
export const createCitySchema = z.object({
  name: z.string().min(1, 'City name is required').trim(),
  slug: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
});

export const updateCitySchema = createCitySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Venue Validation Schemas
export const createVenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required').trim(),
  address: z.string().min(1, 'Address is required').trim(),
  cityId: z.string().min(1, 'City ID is required'),
  capacity: z.number().int().positive().default(100),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateVenueSchema = createVenueSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Reject Organizer Schema
export const rejectOrganizerSchema = z.object({
  reason: z.string().optional(),
});
