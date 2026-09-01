import { api } from './api.js';

export const authService = {
  /**
   * Register New Customer
   * @param {Object} data - { email, password, firstName, lastName, phone }
   */
  registerCustomer: async (data) => {
    return api.post('/auth/customer/register', data);
  },

  /**
   * Register New Event Organizer
   * @param {Object} data - { email, password, firstName, lastName, companyName, businessRegistrationNumber, phone, website }
   */
  registerOrganizer: async (data) => {
    return api.post('/auth/organizer/register', data);
  },

  /**
   * Send / Resend 6-Digit OTP Code
   * @param {string} email
   * @param {string} purpose - "EMAIL_VERIFICATION" | "FORGOT_PASSWORD"
   */
  sendOTP: async (email, purpose = 'EMAIL_VERIFICATION') => {
    return api.post('/auth/send-otp', { email, purpose });
  },

  /**
   * Verify 6-Digit OTP Code
   * @param {string} email
   * @param {string} otp
   * @param {string} purpose - "EMAIL_VERIFICATION" | "FORGOT_PASSWORD"
   */
  verifyOTP: async (email, otp, purpose = 'EMAIL_VERIFICATION') => {
    return api.post('/auth/verify-otp', { email, otp, purpose });
  },

  /**
   * User Login (Customer, Organizer & Super Admin)
   * Automatically routes Super Admin accounts to /admin/login endpoint
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const identifier = credentials.identifier || credentials.email || '';
    const payload = {
      identifier,
      email: identifier.includes('@') ? identifier.trim().toLowerCase() : identifier,
      password: credentials.password,
    };

    if (identifier.toLowerCase().includes('admin') && identifier.includes('@')) {
      try {
        return await api.post('/admin/login', { email: payload.email, password: payload.password });
      } catch {
        // Continue to standard auth login fallback
      }
    }

    try {
      return await api.post('/auth/login', payload);
    } catch (error) {
      if (
        error.message?.includes('/admin/login') ||
        error.message?.toLowerCase().includes('super admin') ||
        error.status === 403
      ) {
        return await api.post('/admin/login', { email: payload.email, password: payload.password });
      }
      throw error;
    }
  },

  /**
   * Super Admin Explicit Login Endpoint (/admin/login)
   * @param {Object} credentials - { email, password }
   */
  adminLogin: async (credentials) => {
    return api.post('/admin/login', credentials);
  },

  /**
   * Refresh JWT Access Token
   * @param {string} refreshToken
   */
  refreshToken: async (refreshToken) => {
    return api.post('/auth/refresh-token', { refreshToken });
  },

  /**
   * Revoke Refresh Token & Logout
   * @param {string} refreshToken
   */
  logout: async (refreshToken) => {
    return api.post('/auth/logout', { refreshToken });
  },

  /**
   * Request Password Reset OTP
   * @param {string} email
   */
  forgotPassword: async (identifier) => {
    return api.post('/auth/forgot-password', { identifier });
  },

  verifyResetOtp: async (data) => {
    return api.post('/auth/verify-reset-otp', data);
  },

  resendResetOtp: async (requestId) => {
    return api.post('/auth/resend-reset-otp', { requestId });
  },

  resetPassword: async (data) => {
    return api.post('/auth/reset-password', data);
  },
};
