import { Router } from 'express';
import { CustomerController } from '../../controllers/customer.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, requireCustomer } from '../../middlewares/auth.middleware.js';
import {
  updateCustomerProfileSchema,
  changePasswordSchema,
  createBookingSchema,
  addWishlistSchema,
  createReviewSchema,
  updateReviewSchema,
} from '../../validators/customer.validator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Customer Module
 *   description: Endpoints restricted strictly to CUSTOMER role
 */

// ==================== PUBLIC EVENT DISCOVERY (GUEST OR AUTHENTICATED) ====================
/**
 * @openapi
 * /customer/events:
 *   get:
 *     summary: Browse & Search Published Events
 *     tags: [Customer Module]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: cityId
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Search results
 */
import { AdminController } from '../../controllers/admin.controller.js';

router.get('/events', CustomerController.browseEvents);
router.get('/cities', AdminController.getAllCities);
router.get('/venues', AdminController.getAllVenues);
router.get('/categories', AdminController.getAllCategories);

/**
 * @openapi
 * /customer/events/{id}:
 *   get:
 *     summary: Get Single Event Details with Ticket Types and Reviews
 *     tags: [Customer Module]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event details
 */
router.get('/events/:id', CustomerController.getEventDetails);

// Protect all subsequent customer endpoints with Authentication & CUSTOMER Authorization Guard
router.use(authenticate);
router.use(requireCustomer);

// ==================== PROFILE MANAGEMENT ====================
/**
 * @openapi
 * /customer/profile:
 *   get:
 *     summary: Get Customer Profile
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile details
 */
router.get('/profile', CustomerController.getProfile);

/**
 * @openapi
 * /customer/profile:
 *   put:
 *     summary: Update Customer Profile
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string, example: John }
 *               lastName: { type: string, example: Doe }
 *               phone: { type: string, example: "+1234567890" }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', validate(updateCustomerProfileSchema), CustomerController.updateProfile);

/**
 * @openapi
 * /customer/change-password:
 *   patch:
 *     summary: Change Customer Account Password
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string, example: CurrentPass123! }
 *               newPassword: { type: string, example: NewSecurePass123! }
 *     responses:
 *       200:
 *         description: Password updated
 */
router.patch('/change-password', validate(changePasswordSchema), CustomerController.changePassword);

/**
 * @openapi
 * /customer/account:
 *   delete:
 *     summary: Soft Delete Customer Account
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Account soft deleted
 */
router.delete('/account', CustomerController.deleteAccount);

// ==================== BOOKINGS ====================
/**
 * @openapi
 * /customer/bookings:
 *   post:
 *     summary: Create Event Booking & Reserve Tickets
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, tickets]
 *             properties:
 *               eventId: { type: string }
 *               tickets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [ticketTypeId, quantity]
 *                   properties:
 *                     ticketTypeId: { type: string }
 *                     quantity: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Booking confirmed and tickets issued
 */
router.post('/bookings', validate(createBookingSchema), CustomerController.createBooking);

/**
 * @openapi
 * /customer/bookings:
 *   get:
 *     summary: Get Customer Booking History
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Booking history list
 */
router.get('/bookings', CustomerController.getBookingHistory);

/**
 * @openapi
 * /customer/bookings/{id}:
 *   get:
 *     summary: Get Single Booking Details
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details
 */
router.get('/bookings/:id', CustomerController.getBookingDetails);

/**
 * @openapi
 * /customer/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel Booking & Restore Ticket Quantities
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.patch('/bookings/:id/cancel', CustomerController.cancelBooking);

// ==================== TICKET & QR PAYLOAD ====================
/**
 * @openapi
 * /customer/tickets/{id}/download:
 *   get:
 *     summary: Download Ticket Summary Payload
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Download payload
 */
router.get('/tickets/:id/download', CustomerController.downloadTicket);

/**
 * @openapi
 * /customer/tickets/{id}/qr:
 *   get:
 *     summary: Get Ticket QR Code Verification Payload
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: QR payload
 */
router.get('/tickets/:id/qr', CustomerController.getQrTicketPayload);

// ==================== WISHLIST ====================
/**
 * @openapi
 * /customer/wishlist:
 *   post:
 *     summary: Add Event to Customer Wishlist
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId: { type: string }
 *     responses:
 *       201:
 *         description: Added to wishlist
 */
router.post('/wishlist', validate(addWishlistSchema), CustomerController.addToWishlist);

/**
 * @openapi
 * /customer/wishlist/{eventId}:
 *   delete:
 *     summary: Remove Event from Customer Wishlist
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Removed from wishlist
 */
router.delete('/wishlist/:eventId', CustomerController.removeFromWishlist);

/**
 * @openapi
 * /customer/wishlist:
 *   get:
 *     summary: View Customer Wishlist
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Wishlist list
 */
router.get('/wishlist', CustomerController.getWishlist);

// ==================== REVIEWS & RATINGS ====================
/**
 * @openapi
 * /customer/events/{eventId}/reviews:
 *   post:
 *     summary: Create Event Review & Rating
 *     tags: [Customer Module]
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
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, example: 5 }
 *               comment: { type: string, example: Amazing festival experience! }
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/events/:eventId/reviews', validate(createReviewSchema), CustomerController.createReview);

/**
 * @openapi
 * /customer/reviews/{id}:
 *   put:
 *     summary: Update Customer Review
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review updated
 */
router.put('/reviews/:id', validate(updateReviewSchema), CustomerController.updateReview);

/**
 * @openapi
 * /customer/reviews/{id}:
 *   delete:
 *     summary: Delete Customer Review
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete('/reviews/:id', CustomerController.deleteReview);

// ==================== NOTIFICATIONS ====================
/**
 * @openapi
 * /customer/notifications:
 *   get:
 *     summary: View Customer Notifications
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/notifications', CustomerController.getNotifications);

/**
 * @openapi
 * /customer/notifications/{id}/read:
 *   patch:
 *     summary: Mark Notification as Read
 *     tags: [Customer Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked read
 */
router.patch('/notifications/:id/read', CustomerController.markNotificationAsRead);

export default router;
