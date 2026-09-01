import { z } from 'zod';
import { OtpPurpose } from '@prisma/client';
import { isValidPhone } from '../utils/phone.util.js';

const requiredPhoneSchema = z
  .string({ required_error: 'Mobile number is required' })
  .min(1, 'Mobile number is required')
  .refine(isValidPhone, 'Enter a valid mobile number (10–15 digits)');

/**
 * Zod Validation Schemas for Authentication APIs
 */

// 1. Customer Registration Schema
export const customerRegisterSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  phone: requiredPhoneSchema,
});

// 2. Event Organizer Registration Schema
export const organizerRegisterSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  companyName: z.string().min(1, 'Company name is required').trim(),
  businessRegistrationNumber: z.string().optional(),
  phone: requiredPhoneSchema,
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
});

// 3. User Login Schema (email or mobile identifier; `email` kept for backward compatibility)
export const loginSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    identifier: z.string().min(1).optional(),
    email: z.string().optional(),
  })
  .refine((data) => String(data.identifier || data.email || '').trim().length > 0, {
    message: 'Email or mobile number is required',
    path: ['identifier'],
  });

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// 4. Send OTP Request Schema
export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  purpose: z.nativeEnum(OtpPurpose, {
    errorMap: () => ({ message: 'Invalid OTP purpose' }),
  }),
});

// 5. Verify OTP Request Schema
export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain numbers only'),
  purpose: z.nativeEnum(OtpPurpose, {
    errorMap: () => ({ message: 'Invalid OTP purpose' }),
  }),
});

// 6. Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// 7. Forgot Password Schema
export const forgotPasswordSchema = z
  .object({
    identifier: z.string().min(1).optional(),
    email: z.string().optional(),
  })
  .refine((data) => String(data.identifier || data.email || '').trim().length > 0, {
    message: 'Email or mobile number is required',
    path: ['identifier'],
  });

export const verifyResetOtpSchema = z.object({
  requestId: z.string().min(1).optional(),
  resetToken: z.string().optional(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain numbers only'),
}).refine((data) => data.requestId || data.resetToken, {
  message: 'Reset request is required',
});

export const resendResetOtpSchema = z.object({
  requestId: z.string().min(1, 'Reset request is required'),
});

// 8. Reset Password Schema
export const resetPasswordSchema = z
  .object({
    resetToken: z.string().optional(),
    email: z.string().email().optional(),
    otp: z.string().length(6).regex(/^\d+$/).optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.resetToken || (data.email && data.otp), {
    message: 'Reset token or email and OTP are required',
  })
  .refine((data) => !data.confirmPassword || data.newPassword === data.confirmPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmPassword'],
  });
