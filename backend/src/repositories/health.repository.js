import { prisma } from '../config/prisma.js';

export class HealthRepository {
  static async checkDatabaseConnection() {
    try {
      // Give MongoDB a maximum of 3 seconds
      // to respond to the health check.
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Database health check timeout'));
        }, 3000);
      });

      await Promise.race([
        prisma.$runCommandRaw({
          ping: 1,
        }),
        timeoutPromise,
      ]);

      return true;
    } catch (error) {
      console.error(
        'Health check database error:',
        error?.message
      );

      return false;
    }
  }
}
