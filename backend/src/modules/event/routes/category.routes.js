import { Router } from 'express';
import { AdminController } from '../../../controllers/admin.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize, requireSuperAdmin } from '../../../middlewares/auth.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../../../validators/admin.validator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Event Categories Module
 *   description: Master Event Categories management (Admin Only)
 */

/**
 * @openapi
 * /event-categories:
 *   get:
 *     summary: List All Event Categories
 *     tags: [Event Categories Module]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', AdminController.getAllCategories);

/**
 * @openapi
 * /event-categories/{id}:
 *   get:
 *     summary: Get Category by ID
 *     tags: [Event Categories Module]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category details
 */
router.get('/:id', AdminController.getCategoryById);

// Admin & Organizer mutating endpoints
router.use(authenticate);

/**
 * @openapi
 * /event-categories:
 *   post:
 *     summary: Create New Category (Admin & Organizers)
 *     tags: [Event Categories Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Music Festivals }
 *               description: { type: string, example: Concerts and live music performances }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'ORGANIZER'), validate(createCategorySchema), AdminController.createCategory);

// Admin-only mutating endpoints
router.use(requireSuperAdmin);

/**
 * @openapi
 * /event-categories/{id}:
 *   put:
 *     summary: Update Category (Admin Only)
 *     tags: [Event Categories Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put('/:id', validate(updateCategorySchema), AdminController.updateCategory);

/**
 * @openapi
 * /event-categories/{id}:
 *   delete:
 *     summary: Delete Category (Admin Only)
 *     tags: [Event Categories Module]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete('/:id', AdminController.deleteCategory);

export default router;
