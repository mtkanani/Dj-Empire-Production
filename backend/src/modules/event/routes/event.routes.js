import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize, optionalAuth, requireSuperAdmin } from '../../../middlewares/auth.middleware.js';
import {
  createEventSchema,
  updateEventSchema,
  createScheduleSchema,
  updateScheduleSchema,
  createVenueSchema,
  updateVenueSchema,
  createImageSchema,
  createFAQSchema,
  updateFAQSchema,
  createPolicySchema,
  createSEOSchema,
  rejectReasonSchema,
} from '../validations/event.validation.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Multi-Tenant Event Management Module
 *   description: Enterprise Event Management, Publishing State Machine & Sub-resource APIs
 */

// ==================== PUBLIC / OPTIONAL AUTHENTICATED EVENT BROWSING ====================
/**
 * @openapi
 * /events:
 *   get:
 *     summary: Search & List Events with Multi-Filter & Pagination
 *     tags: [Multi-Tenant Event Management Module]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string, example: Music Festival }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: eventType
 *         schema: { type: string, enum: [IN_PERSON, ONLINE, HYBRID] }
 *       - in: query
 *         name: city
 *         schema: { type: string, example: Mumbai }
 *     responses:
 *       200:
 *         description: Paginated events list
 */
router.get('/', optionalAuth, EventController.getEvents);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get Single Event Details by ID or Slug
 *     tags: [Multi-Tenant Event Management Module]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event details
 */
router.get('/:id', optionalAuth, EventController.getEventById);

// Sub-resource Public View Endpoints
router.get('/:eventId/schedules', optionalAuth, EventController.getSchedules);
router.get('/:eventId/venue', optionalAuth, EventController.getVenue);
router.get('/:eventId/images', optionalAuth, EventController.getImages);
router.get('/:eventId/faqs', optionalAuth, EventController.getFAQs);
router.get('/:eventId/policy', optionalAuth, EventController.getPolicy);
router.get('/:eventId/seo', optionalAuth, EventController.getSEO);

// Protect all mutating endpoints with JWT Authentication & RBAC Authorization Guards
router.use(authenticate);

// ==================== EVENT CORE MUTATIONS ====================
/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create New Event (Draft Status)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Sunburn Festival 2026 }
 *               shortDescription: { type: string, example: Asia's Premier Electronic Music Festival }
 *               eventType: { type: string, enum: [IN_PERSON, ONLINE, HYBRID], example: IN_PERSON }
 *               price: { type: number, example: 1499.00 }
 *     responses:
 *       201:
 *         description: Event created in Draft status
 */
router.post('/', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createEventSchema), EventController.createEvent);

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     summary: Update Event Details
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put('/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(updateEventSchema), EventController.updateEvent);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Soft Delete Event
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event soft deleted
 */
router.delete('/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.softDeleteEvent);

/**
 * @openapi
 * /events/{id}/restore:
 *   patch:
 *     summary: Restore Soft-Deleted Event (Super Admin Only)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event restored
 */
router.patch('/:id/restore', requireSuperAdmin, EventController.restoreEvent);

/**
 * @openapi
 * /events/{id}/permanent:
 *   delete:
 *     summary: Permanently Delete Event (Super Admin Only)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event permanently purged
 */
router.delete('/:id/permanent', requireSuperAdmin, EventController.permanentDeleteEvent);

// ==================== FINITE STATE MACHINE TRANSITION APIS ====================
/**
 * @openapi
 * /events/{id}/submit-approval:
 *   patch:
 *     summary: Submit Event for Super Admin Approval (Draft -> PendingApproval)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Submitted for approval
 */
router.patch('/:id/submit-approval', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.submitForApproval);

/**
 * @openapi
 * /events/{id}/approve:
 *   patch:
 *     summary: Approve Event (Super Admin Only: PendingApproval -> Approved)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event approved
 */
router.patch('/:id/approve', requireSuperAdmin, EventController.approveEvent);

/**
 * @openapi
 * /events/{id}/reject:
 *   patch:
 *     summary: Reject Event (Super Admin Only: PendingApproval -> Rejected)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event rejected
 */
router.patch('/:id/reject', requireSuperAdmin, validate(rejectReasonSchema), EventController.rejectEvent);

/**
 * @openapi
 * /events/{id}/publish:
 *   patch:
 *     summary: Publish Event Live (Approved -> Published)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event published live
 */
router.patch('/:id/publish', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.publishEvent);

/**
 * @openapi
 * /events/{id}/unpublish:
 *   patch:
 *     summary: Unpublish Event (Published -> Unpublished)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event unpublished
 */
router.patch('/:id/unpublish', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.unpublishEvent);

/**
 * @openapi
 * /events/{id}/cancel:
 *   patch:
 *     summary: Cancel Event (Published -> Cancelled)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event cancelled
 */
router.patch('/:id/cancel', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.cancelEvent);

/**
 * @openapi
 * /events/{id}/archive:
 *   patch:
 *     summary: Archive Event (Any -> Archived)
 *     tags: [Multi-Tenant Event Management Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event archived
 */
router.patch('/:id/archive', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.archiveEvent);

// ==================== SUB-RESOURCE MANAGEMENT APIS ====================

// Event Schedules
router.post('/:eventId/schedules', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createScheduleSchema), EventController.addSchedule);
router.put('/schedules/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(updateScheduleSchema), EventController.updateSchedule);
router.delete('/schedules/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.deleteSchedule);

// Event Venue Details
router.post('/:eventId/venue', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createVenueSchema), EventController.upsertVenue);
router.put('/:eventId/venue', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(updateVenueSchema), EventController.upsertVenue);
router.delete('/:eventId/venue', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.deleteVenue);

// Event Media Images
router.post('/:eventId/images', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createImageSchema), EventController.addImage);
router.put('/images/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createImageSchema), EventController.updateImage);
router.delete('/images/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.deleteImage);

// Event FAQs
router.post('/:eventId/faqs', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createFAQSchema), EventController.addFAQ);
router.put('/faqs/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(updateFAQSchema), EventController.updateFAQ);
router.delete('/faqs/:id', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), EventController.deleteFAQ);

// Event Policy & SEO
router.post('/:eventId/policy', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createPolicySchema), EventController.upsertPolicy);
router.put('/:eventId/policy', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createPolicySchema), EventController.upsertPolicy);
router.post('/:eventId/seo', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createSEOSchema), EventController.upsertSEO);
router.put('/:eventId/seo', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), validate(createSEOSchema), EventController.upsertSEO);

export default router;
