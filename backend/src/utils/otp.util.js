import crypto from 'crypto';

export const OTP_CONSTANTS = Object.freeze({
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_RESEND_LIMIT: 5,
  MAX_VERIFY_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
  RESET_TOKEN_MINUTES: 15,
});

/**
 * OTP Utility Generator & Expiry Helper
 */
export class OtpUtil {
  /**
   * Generate cryptographically secure 6-digit OTP string
   * @returns {string} 6-digit numeric OTP
   */
  static generateOtp() {
    const randomInt = crypto.randomInt(100000, 1000000);
    return randomInt.toString();
  }

  /**
   * Calculate OTP Expiry Date (Default 10 minutes in the future)
   * @param {number} [minutes=10]
   * @returns {Date} Expiration timestamp
   */
  static getOtpExpiration(minutes = OTP_CONSTANTS.EXPIRY_MINUTES) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    return expiresAt;
  }
}
