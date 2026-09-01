import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize, optionalAuth } from '../../../middlewares/auth.middleware.js';
import {
  updateInventorySchema,
  createPricingSchema,
  createBookingRulesSchema,
  createWaitlistSchema,
  createCouponSchema,
  validateCouponQuerySchema,
} from '../validations/ticketing.validation.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Ticketing - Operations Engine Module
 *   description: Inventory Management, Dynamic Pricing, Waitlist, Coupons & Real-Time Availability
 */

// Public / Live Availability & Coupon Validation
/**
 * @openapi
 * /events/{eventId}/availability/live:
 *   get:
 *     summary: Get Real-Time Ticket Availability & Occupancy Statistics
 *     tags: [Ticketing - Operations Engine Module]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Real-time availability stats
 */
router.get('/events/:eventId/availability/live', InventoryController.getLiveAvailability);

router.post('/coupons/validate', validate(validateCouponQuerySchema), InventoryController.validateCoupon);
router.post('/events/:eventId/waitlist', optionalAuth, validate(createWaitlistSchema), InventoryController.joinWaitlist);

// Protected Operations Endpoints Middleware for Admin & Organizer
const requireOrganizerOrAdmin = [authenticate, authorize('SUPER_ADMIN', 'EVENT_ORGANIZER')];

// Coupon Creation (Super Admin / Organizer)
router.post('/coupons', requireOrganizerOrAdmin, validate(createCouponSchema), InventoryController.createCoupon);

// Inventory Operations
router.get('/events/:eventId/inventory', requireOrganizerOrAdmin, InventoryController.getInventory);
router.put('/inventory/:id', requireOrganizerOrAdmin, validate(updateInventorySchema), InventoryController.updateInventory);

// Dynamic Pricing
router.post('/events/:eventId/pricing', requireOrganizerOrAdmin, validate(createPricingSchema), InventoryController.createPricingRule);
router.get('/events/:eventId/pricing', requireOrganizerOrAdmin, InventoryController.getPricingRules);

// Booking Rules
router.post('/events/:eventId/booking-rules', requireOrganizerOrAdmin, validate(createBookingRulesSchema), InventoryController.upsertBookingRules);
router.get('/events/:eventId/booking-rules', requireOrganizerOrAdmin, InventoryController.getBookingRules);

// Waitlist Management
router.get('/events/:eventId/waitlist', requireOrganizerOrAdmin, InventoryController.getWaitlist);

// Analytics Dashboard
router.get('/events/:eventId/analytics/dashboard', requireOrganizerOrAdmin, InventoryController.getTicketingDashboard);

export default router;
