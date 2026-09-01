import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { registerDeviceSchema } from '../validations/checkin.validation.js';

const router = Router();

router.use(authenticate);

router.post('/devices', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER'), validate(registerDeviceSchema), DeviceController.registerDevice);
router.get('/devices', DeviceController.getDevices);
router.delete('/devices/:deviceId', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), DeviceController.deleteDevice);

export default router;
