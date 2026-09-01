import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/events/:eventId/attendance', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER'), AttendanceController.getAttendance);
router.get('/events/:eventId/live-attendance', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER'), AttendanceController.getLiveAttendance);
router.get('/events/:eventId/checkin-history', authorize('SUPER_ADMIN', 'EVENT_ORGANIZER', 'GATE_MANAGER'), AttendanceController.getCheckInHistory);

export default router;
