import { Router } from 'express';
import { CheckInController } from '../controllers/checkin.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import {
  scanEntrySchema,
  manualCheckinSchema,
  syncOfflineLogsSchema,
} from '../validations/checkin.validation.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: QR Check-In & Event Access Control Module
 *   description: Cryptographic QR Generation, Scan Entry, Multi-Gate Validation & Offline Sync Engine
 */

router.use(authenticate);

// QR Generation
router.post('/checkin/generate/:bookingId', CheckInController.generateQr);
router.get('/checkin/qr/:bookingId', CheckInController.generateQr);

// QR Read & Scan Endpoints
router.post('/checkin/validate', validate(scanEntrySchema), CheckInController.validateQr);

/**
 * @openapi
 * /checkin/entry:
 *   post:
 *     summary: Scan QR Ticket & Execute Entrance Access Control Pipeline
 *     tags: [QR Check-In & Event Access Control Module]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrToken]
 *             properties:
 *               qrToken: { type: string }
 *               gateId: { type: string }
 *               deviceId: { type: string }
 *     responses:
 *       200:
 *         description: Check-in completed and entry granted
 */
router.post(
  '/checkin/entry',
  authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER', 'SCANNER_STAFF', 'SECURITY', 'VOLUNTEER'),
  validate(scanEntrySchema),
  CheckInController.scanEntry
);

router.post(
  '/checkin/scan',
  authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER', 'SCANNER_STAFF', 'SECURITY', 'VOLUNTEER'),
  validate(scanEntrySchema),
  CheckInController.scanEntry
);

router.post(
  '/checkin/manual',
  authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER', 'SCANNER_STAFF', 'SECURITY', 'VOLUNTEER'),
  validate(manualCheckinSchema),
  CheckInController.manualCheckIn
);

router.patch(
  '/checkin/revoke/:bookingId',
  authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER'),
  CheckInController.revokeCheckIn
);

router.post('/checkin/sync-offline', validate(syncOfflineLogsSchema), CheckInController.syncOffline);

export default router;
