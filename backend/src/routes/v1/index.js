import { Router } from 'express';
import healthRoute from './health.route.js';
import authRoute from './auth.route.js';
import adminRoute from './admin.route.js';
import organizerRoute from './organizer.route.js';
import customerRoute from './customer.route.js';
import { eventRoutes, categoryRoutes } from '../../modules/event/index.js';
import { sectionRoutes, ticketingRoutes } from '../../modules/ticketing/index.js';
import { bookingRoutes } from '../../modules/booking/index.js';
import { paymentRoutes, webhookRoutes } from '../../modules/payment/index.js';
import { checkinRoutes, gateRoutes, deviceRoutes, attendanceRoutes, scannerRoutes } from '../../modules/checkin/index.js';

const router = Router();

// Mount V1 Sub-routes
router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/admin', adminRoute);
router.use('/organizer', organizerRoute);
router.use('/customer', customerRoute);

// Mount Event & Category Routes
router.use('/events', eventRoutes);
router.use('/event-categories', categoryRoutes);

// Mount Ticketing & Event Operations Routes
router.use('/', sectionRoutes);
router.use('/', ticketingRoutes);
router.use('/ticketing', ticketingRoutes);

// Mount Customer Booking & Reservation Module Routes
router.use('/', bookingRoutes);

// Mount Payment Gateway, Financial Management & Webhook Routes
router.use('/', paymentRoutes);
router.use('/', webhookRoutes);

// Mount QR Check-In & Event Access Management Routes
router.use('/', checkinRoutes);
router.use('/', gateRoutes);
router.use('/', deviceRoutes);
router.use('/', attendanceRoutes);
router.use('/', scannerRoutes);

export default router;
