import { prisma } from '../config/prisma.js';

/**
 * Health Repository for database health checks
 */
export class HealthRepository {
  /**
   * Check MongoDB connection using Prisma
   * @returns {Promise<boolean>}
   */
  static async checkDatabaseConnection() {
    try {
      await prisma.$runCommandRaw({
        ping: 1,
      });

      return true;
    } catch (error) {
      console.error('Health check database error:', error?.message);
      return false;
    }
  }
}
