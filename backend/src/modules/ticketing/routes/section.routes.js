import { Router } from 'express';
import { SectionController } from '../controllers/section.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize, optionalAuth } from '../../../middlewares/auth.middleware.js';
import {
  createSectionSchema,
  updateSectionSchema,
  createTicketTypeSchema,
  updateTicketTypeSchema,
} from '../validations/ticketing.validation.js';

const router = Router({ mergeParams: true });

/**
 * @openapi
 * tags:
 *   name: Ticketing - Event Sections & Ticket Types Module
 *   description: Section allocation, Capacity enforcement & Ticket Types
 */

// Public / Guest endpoints for viewing event sections, ticket types, live inventory & seat map
router.get('/events/:eventId/sections', optionalAuth, SectionController.getSections);
router.get('/events/:eventId/sections/:sectionId', optionalAuth, SectionController.getSectionById);
router.get('/events/:eventId/sections/:sectionId/ticket-types', optionalAuth, SectionController.getTicketTypes);

// Live Real-Time Availability & Seat Map Grid
router.get('/events/:eventId/availability/live', optionalAuth, SectionController.getLiveInventory);
router.get('/events/:eventId/sections/:sectionId/seats', optionalAuth, SectionController.getSectionSeats);
router.post('/events/:eventId/sections/:sectionId/hold-seats', authenticate, SectionController.holdSeats);
router.post('/events/:eventId/hold-seats', authenticate, SectionController.holdSeats);

// Protected endpoint middleware for Admin & Organizer section management
const requireOrganizerOrAdmin = [authenticate, authorize('SUPER_ADMIN', 'EVENT_ORGANIZER')];

/**
 * @openapi
 * /events/{eventId}/sections:
 *   post:
 *     summary: Create Custom Event Section (VIP, Platinum, Gold, etc.)
 *     tags: [Ticketing - Event Sections & Ticket Types Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, capacity]
 *             properties:
 *               name: { type: string, example: VIP Lounge }
 *               capacity: { type: integer, example: 500 }
 *               color: { type: string, example: "#EAB308" }
 *     responses:
 *       201:
 *         description: Section created
 */
router.post('/events/:eventId/sections', requireOrganizerOrAdmin, validate(createSectionSchema), SectionController.createSection);
router.put('/events/:eventId/sections/:sectionId', requireOrganizerOrAdmin, validate(updateSectionSchema), SectionController.updateSection);
router.delete('/events/:eventId/sections/:sectionId', requireOrganizerOrAdmin, SectionController.deleteSection);

// Ticket Types under Section
router.post(
  '/events/:eventId/sections/:sectionId/ticket-types',
  requireOrganizerOrAdmin,
  validate(createTicketTypeSchema),
  SectionController.createTicketType
);
router.put('/tickets/types/:id', requireOrganizerOrAdmin, validate(updateTicketTypeSchema), SectionController.updateTicketType);
router.delete('/tickets/types/:id', requireOrganizerOrAdmin, SectionController.deleteTicketType);
router.post('/sections/:sectionId/seats/block', requireOrganizerOrAdmin, SectionController.setSeatsBlockedStatus);

export default router;
