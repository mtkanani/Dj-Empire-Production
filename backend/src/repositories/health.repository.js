import { prisma } from '../config/prisma.js';

/**
 * Health Repository for low-level database health checks
 */
export class HealthRepository {
  /**
   * Check database connection status using Prisma (compatible with MongoDB and SQL)
   * @returns {Promise<boolean>}
   */
  static async checkDatabaseConnection() {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    );

    try {
      await Promise.race([
        prisma.$runCommandRaw ? prisma.$runCommandRaw({ ping: 1 }) : prisma.$queryRaw`SELECT 1`,
        timeoutPromise,
      ]);
      return true;
    } catch (error) {
      return false;
    }
  }
}
