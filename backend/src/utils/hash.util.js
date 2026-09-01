import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hashing Utility for Password & OTP security
 */
export class HashUtil {
  /**
   * Hash plain-text password using bcrypt
   * @param {string} password
   * @returns {Promise<string>}
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare plain-text password against stored bcrypt hash
   * @param {string} password
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Hash 6-digit OTP code before database persistence
   * @param {string} otp
   * @returns {Promise<string>}
   */
  static async hashOtp(otp) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
  }

  /**
   * Verify plain OTP code against stored OTP hash
   * @param {string} otp
   * @param {string} hashedOtp
   * @returns {Promise<boolean>}
   */
  static async compareOtp(otp, hashedOtp) {
    return bcrypt.compare(otp, hashedOtp);
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(String(token)).digest('hex');
  }
}
