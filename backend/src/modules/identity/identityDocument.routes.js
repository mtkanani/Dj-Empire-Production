import { Router } from 'express';
import { IdentityDocumentController } from './identityDocument.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { identityDocumentUpload } from '../../middlewares/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.post(
  '/identity-documents',
  authorize('CUSTOMER', 'EVENT_ORGANIZER', 'SUPER_ADMIN'),
  identityDocumentUpload,
  IdentityDocumentController.upload
);

router.get(
  '/identity-documents/:documentId',
  authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'),
  IdentityDocumentController.download
);

export default router;
