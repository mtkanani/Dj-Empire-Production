import jwt from 'jsonwebtoken';
import { env } from './env.js';

/**
 * JWT Token Management Helper
 */
export class JwtConfig {
  /**
   * Sign Access Token (Default 15 minutes expiry)
   * @param {Object} payload - Token payload (userId, email, role, status)
   * @returns {string} Signed JWT Token
   */
  static signAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
  }

  /**
   * Sign Refresh Token (Default 7 days expiry)
   * @param {Object} payload - Token payload (userId)
   * @returns {string} Signed JWT Token
   */
  static signRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
  }

  /**
   * Verify Access Token
   * @param {string} token
   * @returns {Object} Decoded payload
   */
  static verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  }

  /**
   * Verify Refresh Token
   * @param {string} token
   * @returns {Object} Decoded payload
   */
  static verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  }
}
