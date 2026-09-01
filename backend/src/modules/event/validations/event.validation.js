import { z } from 'zod';

/**
 * Zod Validation Schemas for Event Management Module
 */

// 1. Create Event Schema
export const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').trim(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  cityId: z.string().optional(),
  venueId: z.string().optional(),
  eventType: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID']).default('IN_PERSON'),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).default('PUBLIC'),
  language: z.string().default('English'),
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  price: z.number().nonnegative('Price cannot be negative').default(0.0),
  publishAt: z.string().datetime().optional().or(z.string().min(1)).optional(),
  unpublishAt: z.string().datetime().optional().or(z.string().min(1)).optional(),
  ageRestriction: z.string().default('All Ages'),
  featured: z.boolean().default(false),
  featuredUntil: z.string().datetime().optional().or(z.string().min(1)).optional(),
  termsAccepted: z.boolean().default(true),
});

// 2. Update Event Schema
export const updateEventSchema = createEventSchema.partial();

// 3. Event Schedule Base Object & Validation Schema
const scheduleBaseObject = z.object({
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  startTime: z.string().min(1, 'Start Time is required (e.g. 18:00)'),
  endTime: z.string().min(1, 'End Time is required (e.g. 22:00)'),
  gateOpenTime: z.string().optional(),
  bookingCloseTime: z.string().optional(),
});

export const createScheduleSchema = scheduleBaseObject.refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: 'End Date must be greater than or equal to Start Date',
    path: ['endDate'],
  }
);

export const updateScheduleSchema = scheduleBaseObject.partial();

// 4. Event Venue Location Schema
export const createVenueSchema = z.object({
  venueName: z.string().min(1, 'Venue name is required').trim(),
  address: z.string().min(1, 'Address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().optional(),
  country: z.string().default('India'),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.number().int().positive('Capacity must be positive').default(100),
  parkingAvailable: z.boolean().default(false),
  wheelchairAccessible: z.boolean().default(true),
  foodAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
});

export const updateVenueSchema = createVenueSchema.partial();

// 5. Event Image Media Schema
export const createImageSchema = z.object({
  type: z.enum(['BANNER', 'POSTER', 'GALLERY', 'THUMBNAIL']).default('BANNER'),
  imageUrl: z.string().url('Invalid image URL'),
  displayOrder: z.number().int().default(0),
});

// 6. Event FAQ Schema
export const createFAQSchema = z.object({
  question: z.string().min(1, 'Question is required').trim(),
  answer: z.string().min(1, 'Answer is required').trim(),
  displayOrder: z.number().int().default(0),
});

export const updateFAQSchema = createFAQSchema.partial();

// 7. Event Policy Schema
export const createPolicySchema = z.object({
  refundPolicy: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  entryPolicy: z.string().optional(),
  cameraPolicy: z.string().optional(),
  foodPolicy: z.string().optional(),
  childPolicy: z.string().optional(),
  parkingPolicy: z.string().optional(),
  idProofRequired: z.boolean().default(true),
});

// 8. Event SEO Schema
export const createSEOSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  ogImage: z.string().url().optional().or(z.literal('')),
});

// 9. Rejection Reason Schema
export const rejectReasonSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});
