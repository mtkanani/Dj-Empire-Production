import { prisma } from '../config/prisma.js';

/**
 * Token Repository encapsulating RefreshToken database operations
 */
export class TokenRepository {
  /**
   * Create new RefreshToken record
   * @param {Object} tokenData
   * @returns {Promise<Object>}
   */
  static async createToken(tokenData) {
    return prisma.refreshToken.create({
      data: tokenData,
    });
  }

  /**
   * Find RefreshToken by token string
   * @param {string} token
   * @returns {Promise<Object|null>}
   */
  static async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Revoke specific RefreshToken
   * @param {string} token
   * @returns {Promise<Object>}
   */
  static async revokeToken(token) {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all active RefreshTokens for a User
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async revokeAllUserTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
