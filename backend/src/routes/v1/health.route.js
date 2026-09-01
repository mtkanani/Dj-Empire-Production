import { Router } from 'express';
import { HealthController } from '../../controllers/health.controller.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System Health Check
 *     description: Public endpoint to verify server status and metadata
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 data:
 *                   type: object
 *                   properties:
 *                     appName:
 *                       type: string
 *                       example: Event Booking Platform
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     environment:
 *                       type: string
 *                       example: development
 *                     uptime:
 *                       type: string
 *                       example: 12.34s
 *                     timestamp:
 *                       type: string
 *                       example: 2026-08-05T10:00:00.000Z
 *                 meta:
 *                   type: object
 */
router.get('/', HealthController.getHealth);

export default router;
