import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authLimiter, otpLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
  customerRegisterSchema,
  organizerRegisterSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
  resendResetOtpSchema,
} from '../../validators/auth.validator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: Public Customer & Event Organizer Authentication APIs
 */

/**
 * @openapi
 * /auth/customer/register:
 *   post:
 *     summary: Register New Customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, phone]
 *             properties:
 *               email: { type: string, example: customer@example.com }
 *               password: { type: string, example: Password123! }
 *               firstName: { type: string, example: John }
 *               lastName: { type: string, example: Doe }
 *               phone: { type: string, example: "+1234567890" }
 *     responses:
 *       201:
 *         description: Customer registered successfully (Status PENDING_EMAIL_VERIFICATION)
 */
router.post('/customer/register', authLimiter, validate(customerRegisterSchema), AuthController.registerCustomer);

/**
 * @openapi
 * /auth/organizer/register:
 *   post:
 *     summary: Register New Event Organizer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, companyName, phone]
 *             properties:
 *               email: { type: string, example: organizer@eventco.com }
 *               password: { type: string, example: OrganizerPass123! }
 *               firstName: { type: string, example: Alice }
 *               lastName: { type: string, example: Smith }
 *               companyName: { type: string, example: Apex Event Management LLC }
 *               businessRegistrationNumber: { type: string, example: REG-998877 }
 *               phone: { type: string, example: "+1987654321" }
 *               website: { type: string, example: "https://apexevents.com" }
 *     responses:
 *       201:
 *         description: Event Organizer registered (Status PENDING_EMAIL_VERIFICATION)
 */
router.post('/organizer/register', authLimiter, validate(organizerRegisterSchema), AuthController.registerOrganizer);

/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     summary: Send or Resend 6-Digit OTP Code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, purpose]
 *             properties:
 *               email: { type: string, example: customer@example.com }
 *               purpose: { type: string, enum: [EMAIL_VERIFICATION, FORGOT_PASSWORD] }
 *     responses:
 *       200:
 *         description: OTP code sent successfully
 */
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), AuthController.sendOtp);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     summary: Verify 6-Digit OTP Code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, purpose]
 *             properties:
 *               email: { type: string, example: customer@example.com }
 *               otp: { type: string, example: "123456" }
 *               purpose: { type: string, enum: [EMAIL_VERIFICATION, FORGOT_PASSWORD] }
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User Login (Customer & Organizer)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               identifier: { type: string, example: "customer@example.com or +919876543210" }
 *               email: { type: string, example: customer@example.com, description: Backward compatible alias for identifier }
 *               password: { type: string, example: Password123! }
 *     responses:
 *       200:
 *         description: Returns Access Token & Refresh Token
 */
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh JWT Access Token (Token Rotation)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New Access and Refresh tokens issued
 */
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout and Revoke Refresh Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', AuthController.logout);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request Password Reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: customer@example.com }
 *     responses:
 *       200:
 *         description: Reset OTP code dispatched
 */
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);

/**
 * @openapi
 * /auth/verify-reset-otp:
 *   post:
 *     summary: Verify password-reset OTP and issue a short-lived reset token
 */
router.post('/verify-reset-otp', otpLimiter, validate(verifyResetOtpSchema), AuthController.verifyResetOtp);

/**
 * @openapi
 * /auth/resend-reset-otp:
 *   post:
 *     summary: Resend password-reset OTP to the registered email
 */
router.post('/resend-reset-otp', otpLimiter, validate(resendResetOtpSchema), AuthController.resendResetOtp);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset Password Using Verified OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email: { type: string, example: customer@example.com }
 *               otp: { type: string, example: "123456" }
 *               newPassword: { type: string, example: NewSecurePass123! }
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

export default router;
