import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { ReservationController } from '../controllers/reservation.controller.js';
import { MyBookingController } from '../controllers/myBooking.controller.js';
import { OrganizerBookingController } from '../controllers/organizerBooking.controller.js';
import { QrController } from '../controllers/qr.controller.js';
import { TicketController } from '../controllers/ticket.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize, requireSuperAdmin } from '../../../middlewares/auth.middleware.js';
import { ticketResendLimiter, ticketVerifyLimiter } from '../../../middlewares/rateLimiter.middleware.js';
import { verifyTicketSchema } from '../validations/ticket.validation.js';
import {
  createReservationSchema,
  createBookingSchema,
  confirmBookingSchema,
  cancelBookingSchema,
} from '../validations/booking.validation.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Customer Booking & Reservation Module
 *   description: Enterprise Booking Lifecycle, 15-Minute Inventory Locking & QR Ticket APIs
 */

// Protect all booking endpoints with JWT Authentication
router.use(authenticate);

// ==================== RESERVATIONS ====================
/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Reserve Ticket Inventory (15-Minute Lock)
 *     tags: [Customer Booking & Reservation Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, quantity]
 *             properties:
 *               eventId: { type: string }
 *               quantity: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Inventory locked for 15 minutes
 */
router.post('/reservations', authorize('CUSTOMER', 'EVENT_ORGANIZER', 'SUPER_ADMIN'), validate(createReservationSchema), ReservationController.createReservation);
router.get('/reservations/:reservationId', ReservationController.getReservation);
router.delete('/reservations/:reservationId', authorize('CUSTOMER', 'EVENT_ORGANIZER', 'SUPER_ADMIN'), ReservationController.cancelReservation);

// ==================== BOOKINGS ====================
/**
 * @openapi
 * /bookings:
 *   post:
 *     summary: Create Event Booking & Initiate Checkout
 *     tags: [Customer Booking & Reservation Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, quantity]
 *             properties:
 *               eventId: { type: string }
 *               quantity: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/bookings', authorize('CUSTOMER', 'EVENT_ORGANIZER', 'SUPER_ADMIN'), validate(createBookingSchema), BookingController.createBooking);
router.get('/bookings', requireSuperAdmin, BookingController.getBookings);

/**
 * @openapi
 * /bookings/{bookingId}/ticket:
 *   get:
 *     summary: Get complete ticket payload for a booking (one QR per ticket)
 *     tags: [Customer Booking & Reservation Module]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/bookings/:bookingId/ticket', authorize('CUSTOMER'), TicketController.getTicket);

/**
 * @openapi
 * /bookings/{bookingId}/ticket/download:
 *   get:
 *     summary: Download booking tickets as PDF (one page / QR per ticket)
 *     tags: [Customer Booking & Reservation Module]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/bookings/:bookingId/ticket/download', authorize('CUSTOMER'), TicketController.downloadTicket);

/**
 * @openapi
 * /bookings/{bookingId}/ticket/resend:
 *   post:
 *     summary: Resend ticket email with one unique QR image per ticket
 *     tags: [Customer Booking & Reservation Module]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/bookings/:bookingId/ticket/resend', ticketResendLimiter, authorize('CUSTOMER'), TicketController.resendTicket);

/**
 * @openapi
 * /tickets/verify:
 *   post:
 *     summary: Verify a ticket QR at the gate and mark it USED (atomic)
 *     tags: [Customer Booking & Reservation Module]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/tickets/verify',
  ticketVerifyLimiter,
  authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER', 'SCANNER_STAFF', 'SECURITY', 'VOLUNTEER'),
  validate(verifyTicketSchema),
  TicketController.verifyTicket
);

router.get('/bookings/:bookingId', BookingController.getBookingById);
router.patch('/bookings/:bookingId/confirm', validate(confirmBookingSchema), BookingController.confirmBooking);
router.patch('/bookings/:bookingId/cancel', validate(cancelBookingSchema), BookingController.cancelBooking);
router.get('/bookings/:bookingId/items', BookingController.getBookingItems);

// ==================== QR CODE TICKET ====================
router.get('/bookings/:bookingId/tickets/:ticketId/qr', authorize('CUSTOMER'), QrController.generateQrTicket);

// ==================== CUSTOMER MY-BOOKINGS ====================
router.get('/my-bookings', authorize('CUSTOMER'), MyBookingController.getMyBookings);
router.get('/my-bookings/:bookingId', authorize('CUSTOMER'), MyBookingController.getMyBookingById);
router.get('/my-upcoming-events', authorize('CUSTOMER'), MyBookingController.getMyUpcomingEvents);
router.get('/my-past-events', authorize('CUSTOMER'), MyBookingController.getMyPastEvents);

// ==================== ORGANIZER BOOKINGS ====================
router.get('/organizer/bookings', authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'), OrganizerBookingController.getOrganizerBookings);
router.get('/organizer/bookings/:bookingId', authorize('EVENT_ORGANIZER', 'SUPER_ADMIN'), OrganizerBookingController.getOrganizerBookingById);

export default router;
