import { Router } from 'express';
import { OrganizerController } from '../../controllers/organizer.controller.js';
import { AdminController } from '../../controllers/admin.controller.js';
import { PaymentController } from '../../modules/payment/controllers/payment.controller.js';
import { RefundController } from '../../modules/payment/controllers/refund.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, requireOrganizer } from '../../middlewares/auth.middleware.js';
import {
  updateOrganizerProfileSchema,
  createEventSchema,
  updateEventSchema,
  createTicketTypeSchema,
  updateTicketTypeSchema,
  checkInSchema,
} from '../../validators/organizer.validator.js';
import {
  createCategorySchema,
  createCitySchema,
  createVenueSchema,
} from '../../validators/admin.validator.js';

const router = Router();

// Protect all organizer routes with Authentication & EVENT_ORGANIZER Authorization Guard
router.use(authenticate);
router.use(requireOrganizer);

/**
 * @openapi
 * tags:
 *   name: Event Organizer Module
 *   description: Endpoints restricted strictly to EVENT_ORGANIZER role
 */

// ==================== PROFILE MANAGEMENT ====================
/**
 * @openapi
 * /organizer/profile:
 *   get:
 *     summary: Get Organizer Profile Details
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Organizer profile details retrieved
 */
router.get('/profile', OrganizerController.getProfile);

/**
 * @openapi
 * /organizer/profile:
 *   put:
 *     summary: Update Organizer Company Profile
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName: { type: string, example: Apex Event Management LLC }
 *               website: { type: string, example: "https://apexevents.com" }
 *               phone: { type: string, example: "+1987654321" }
 *               address: { type: string, example: "123 Event St, Suite 400" }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', validate(updateOrganizerProfileSchema), OrganizerController.updateProfile);

// ==================== ORGANIZER ANALYTICS ====================
/**
 * @openapi
 * /organizer/analytics:
 *   get:
 *     summary: Get Organizer Dashboard Analytics Metrics
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Monthly revenue, today's sales, and event counters
 */
router.get('/analytics', OrganizerController.getAnalytics);

// ==================== EVENT MANAGEMENT ====================
/**
 * @openapi
 * /organizer/events:
 *   post:
 *     summary: Create New Event (Draft Status)
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Summer Music & Tech Festival 2026 }
 *               description: { type: string, example: The premier outdoor festival }
 *               bannerUrl: { type: string, example: "https://example.com/banner.jpg" }
 *               price: { type: number, example: 99.99 }
 *     responses:
 *       201:
 *         description: Event created in DRAFT status
 */
router.post('/events', validate(createEventSchema), OrganizerController.createEvent);

/**
 * @openapi
 * /organizer/events:
 *   get:
 *     summary: List All Events Created by Organizer
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of organizer events
 */
router.get('/events', OrganizerController.getEvents);

/**
 * @openapi
 * /organizer/events/{id}:
 *   get:
 *     summary: Get Event Details
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event details
 */
router.get('/events/:id', OrganizerController.getEventById);

/**
 * @openapi
 * /organizer/events/{id}:
 *   put:
 *     summary: Update Event Details
 *     tags: [Event Organizer Module]
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
router.put('/events/:id', validate(updateEventSchema), OrganizerController.updateEvent);

/**
 * @openapi
 * /organizer/events/{id}:
 *   delete:
 *     summary: Delete Event
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete('/events/:id', OrganizerController.deleteEvent);

/**
 * @openapi
 * /organizer/events/{id}/publish:
 *   patch:
 *     summary: Publish Event (Set status PUBLISHED)
 *     tags: [Event Organizer Module]
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
router.patch('/events/:id/publish', OrganizerController.publishEvent);

/**
 * @openapi
 * /organizer/events/{id}/unpublish:
 *   patch:
 *     summary: Unpublish Event (Revert status to DRAFT)
 *     tags: [Event Organizer Module]
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
router.patch('/events/:id/unpublish', OrganizerController.unpublishEvent);

// ==================== TICKET MANAGEMENT ====================
/**
 * @openapi
 * /organizer/events/{eventId}/tickets:
 *   post:
 *     summary: Create Ticket Type for an Event
 *     tags: [Event Organizer Module]
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
 *             required: [name, price, quantityTotal]
 *             properties:
 *               name: { type: string, example: VIP Pass }
 *               price: { type: number, example: 149.99 }
 *               quantityTotal: { type: integer, example: 50 }
 *     responses:
 *       201:
 *         description: Ticket Type created
 */
router.post('/events/:eventId/tickets', validate(createTicketTypeSchema), OrganizerController.createTicketType);

/**
 * @openapi
 * /organizer/events/{eventId}/tickets:
 *   get:
 *     summary: List All Ticket Types for an Event
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of ticket types
 */
router.get('/events/:eventId/tickets', OrganizerController.getTicketTypes);

/**
 * @openapi
 * /organizer/tickets/{id}:
 *   put:
 *     summary: Update Ticket Type
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ticket type updated
 */
router.put('/tickets/:id', validate(updateTicketTypeSchema), OrganizerController.updateTicketType);

/**
 * @openapi
 * /organizer/tickets/{id}:
 *   delete:
 *     summary: Delete Ticket Type
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ticket type deleted
 */
router.delete('/tickets/:id', OrganizerController.deleteTicketType);

// ==================== BOOKING DASHBOARD ====================
/**
 * @openapi
 * /organizer/bookings:
 *   get:
 *     summary: View Bookings for Organizer Events
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/bookings', OrganizerController.getBookings);

/**
 * @openapi
 * /organizer/bookings/{id}:
 *   get:
 *     summary: Get Booking Details
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details retrieved
 */
router.get('/bookings/:id', OrganizerController.getBookingById);

router.get('/payments', PaymentController.getOrganizerPayments);
router.get('/refunds', RefundController.getOrganizerRefunds);

// ==================== QR CHECK-IN & ATTENDANCE ====================
/**
 * @openapi
 * /organizer/check-in/verify:
 *   post:
 *     summary: Verify Ticket Code / QR Payload
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketCode]
 *             properties:
 *               ticketCode: { type: string, example: TCK-88997766 }
 *     responses:
 *       200:
 *         description: Verification result
 */
router.post('/check-in/verify', validate(checkInSchema), OrganizerController.verifyTicket);

/**
 * @openapi
 * /organizer/check-in/mark-attendance:
 *   post:
 *     summary: Mark Ticket Attendance (Check-In)
 *     tags: [Event Organizer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketCode]
 *             properties:
 *               ticketCode: { type: string, example: TCK-88997766 }
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 */
router.post('/check-in/mark-attendance', validate(checkInSchema), OrganizerController.markAttendance);

// ==================== MASTER DATA ENDPOINTS FOR ORGANIZERS ====================
router.get('/categories', AdminController.getAllCategories);
router.get('/cities', AdminController.getAllCities);
router.get('/venues', AdminController.getAllVenues);
router.post('/categories', validate(createCategorySchema), AdminController.createCategory);
router.post('/cities', validate(createCitySchema), AdminController.createCity);
router.post('/venues', validate(createVenueSchema), AdminController.createVenue);

export default router;
