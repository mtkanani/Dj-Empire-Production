import { Router } from 'express';
import { GateController } from '../controllers/gate.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { createGateSchema } from '../validations/checkin.validation.js';

const router = Router();

router.use(authenticate);

router.post('/gates', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER'), validate(createGateSchema), GateController.createGate);
router.get('/gates', GateController.getGates);
router.put('/gates/:gateId', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER'), GateController.updateGate);
router.delete('/gates/:gateId', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER'), GateController.deleteGate);

export default router;
