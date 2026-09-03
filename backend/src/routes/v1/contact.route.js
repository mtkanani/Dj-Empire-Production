import { Router } from 'express';
import { ContactController } from '../../controllers/contact.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { contactFormSchema } from '../../validators/contact.validator.js';

const router = Router();

router.post('/', authLimiter, validate(contactFormSchema), ContactController.submit);

export default router;
