import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller.js';
import { TaxSettingController } from '../../controllers/taxSetting.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, requireSuperAdmin } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { adminLoginSchema } from '../../validators/auth.validator.js';
import {
  createCategorySchema,
  updateCategorySchema,
  createCitySchema,
  updateCitySchema,
  createVenueSchema,
  updateVenueSchema,
  rejectOrganizerSchema,
} from '../../validators/admin.validator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Super Admin Module
 *   description: Endpoints restricted strictly to SUPER_ADMIN role
 */

// ==================== ADMIN LOGIN (PUBLIC) ====================
/**
 * @openapi
 * /admin/login:
 *   post:
 *     summary: Super Admin Login
 *     tags: [Super Admin Module]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@eventbooking.com }
 *               password: { type: string, example: SuperAdminPassword123! }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, validate(adminLoginSchema), AdminController.adminLogin);

// Protect all subsequent admin routes with Authentication & SUPER_ADMIN Authorization
router.use(authenticate);
router.use(requireSuperAdmin);

// ==================== DASHBOARD & ANALYTICS ====================
/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     summary: Get Super Admin Analytics Dashboard Metrics
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved
 */
router.get('/dashboard', AdminController.getDashboard);
router.get('/events', AdminController.getAllEvents);

// ==================== ORGANIZER MANAGEMENT ====================
/**
 * @openapi
 * /admin/organizers:
 *   get:
 *     summary: List All Event Organizers
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING_EMAIL_VERIFICATION, PENDING_APPROVAL, ACTIVE, SUSPENDED] }
 *     responses:
 *       200:
 *         description: Organizers list retrieved
 */
router.get('/organizers', AdminController.getAllOrganizers);

/**
 * @openapi
 * /admin/organizers/{id}:
 *   get:
 *     summary: Get Single Event Organizer Details
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Organizer details retrieved
 */
router.get('/organizers/:id', AdminController.getOrganizerById);

/**
 * @openapi
 * /admin/organizers/{id}/approve:
 *   patch:
 *     summary: Approve Pending Event Organizer Application
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Organizer approved
 */
router.patch('/organizers/:id/approve', AdminController.approveOrganizer);

/**
 * @openapi
 * /admin/organizers/{id}/reject:
 *   patch:
 *     summary: Reject Event Organizer Application
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: Missing valid tax clearance documentation }
 *     responses:
 *       200:
 *         description: Organizer application rejected
 */
router.patch('/organizers/:id/reject', validate(rejectOrganizerSchema), AdminController.rejectOrganizer);

/**
 * @openapi
 * /admin/organizers/{id}/suspend:
 *   patch:
 *     summary: Suspend Event Organizer Account
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Organizer suspended
 */
router.patch('/organizers/:id/suspend', AdminController.suspendOrganizer);

// ==================== CUSTOMER MANAGEMENT ====================
/**
 * @openapi
 * /admin/customers:
 *   get:
 *     summary: List All Registered Customers
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Customers list retrieved
 */
router.get('/customers', AdminController.getAllCustomers);

/**
 * @openapi
 * /admin/customers/{id}:
 *   get:
 *     summary: Get Single Customer Details
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer details retrieved
 */
router.get('/customers/:id', AdminController.getCustomerById);

/**
 * @openapi
 * /admin/customers/{id}/suspend:
 *   patch:
 *     summary: Suspend Customer Account
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer account suspended
 */
router.patch('/customers/:id/suspend', AdminController.suspendCustomer);

/**
 * @openapi
 * /admin/customers/{id}/activate:
 *   patch:
 *     summary: Re-activate Customer Account
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer account activated
 */
router.patch('/customers/:id/activate', AdminController.activateCustomer);

// ==================== CATEGORY CRUD ====================
router.post('/categories', validate(createCategorySchema), AdminController.createCategory);
router.get('/categories', AdminController.getAllCategories);
router.get('/categories/:id', AdminController.getCategoryById);
router.put('/categories/:id', validate(updateCategorySchema), AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// ==================== CITY CRUD ====================
router.post('/cities', validate(createCitySchema), AdminController.createCity);
router.get('/cities', AdminController.getAllCities);
router.get('/cities/:id', AdminController.getCityById);
router.put('/cities/:id', validate(updateCitySchema), AdminController.updateCity);
router.delete('/cities/:id', AdminController.deleteCity);

// ==================== VENUE CRUD ====================
router.post('/venues', validate(createVenueSchema), AdminController.createVenue);
router.get('/venues', AdminController.getAllVenues);
router.get('/venues/:id', AdminController.getVenueById);
router.put('/venues/:id', validate(updateVenueSchema), AdminController.updateVenue);
router.delete('/venues/:id', AdminController.deleteVenue);

// ==================== ADMIN TAX & GST SETTINGS ====================
router.get('/tax-settings', TaxSettingController.getTaxSettings);
router.post('/tax-settings', TaxSettingController.updateTaxSettings);

// ==================== PLATFORM PAYMENTS (ALL ORGANIZERS / EVENTS) ====================
/**
 * @openapi
 * /admin/payments:
 *   get:
 *     summary: List all platform payments across every organizer and event
 *     tags: [Super Admin Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Platform payments list
 */
router.get('/payments', AdminController.getAllPayments);

export default router;
