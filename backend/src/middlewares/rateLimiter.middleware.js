import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Rate Limiter Middleware for Authentication Endpoints
 */

// General Auth Limiter (15 minutes, max 20 requests)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    errors: [],
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict OTP Resend Limiter (15 minutes, max 5 requests)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait before requesting another code.',
    errors: [],
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const ticketResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many ticket resend requests. Please try again later.',
    errors: [],
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const ticketVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many ticket verification attempts. Please slow down.',
    errors: [],
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
