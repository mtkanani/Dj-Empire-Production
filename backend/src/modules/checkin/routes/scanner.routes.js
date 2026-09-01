import { Router } from 'express';
import { ScannerController } from '../controllers/scanner.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, requireOrganizer } from '../../../middlewares/auth.middleware.js';
import { createScannerSchema, scannerLoginSchema, updateScannerSchema } from '../validations/scanner.validation.js';

const router = Router();

// Public Scanner Staff Login Endpoint (No bearer token required)
router.post('/checkin/scanner/login', validate(scannerLoginSchema), ScannerController.scannerLogin);

// Event Organizer Scanner Credentials Management Routes
router.post(
  '/organizer/events/:eventId/scanners',
  authenticate,
  requireOrganizer,
  validate(createScannerSchema),
  ScannerController.createScanner
);

router.get(
  '/organizer/events/:eventId/scanners',
  authenticate,
  requireOrganizer,
  ScannerController.getEventScanners
);

router.put(
  '/organizer/events/:eventId/scanners/:scannerId',
  authenticate,
  requireOrganizer,
  validate(updateScannerSchema),
  ScannerController.updateScanner
);

router.delete(
  '/organizer/events/:eventId/scanners/:scannerId',
  authenticate,
  requireOrganizer,
  ScannerController.deleteScanner
);

router.get(
  '/organizer/events/:eventId/dashboard/scanner-metrics',
  authenticate,
  requireOrganizer,
  ScannerController.getDashboardScannerMetrics
);

export default router;
