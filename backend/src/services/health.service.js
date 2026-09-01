import { env } from '../config/env.js';
import { HealthRepository } from '../repositories/health.repository.js';

/**
 * Health Service handling application business logic for health checks
 */
export class HealthService {
  /**
   * Get server health status and metadata
   * @returns {Promise<Object>}
   */
  static async getHealthStatus() {
    const isDbConnected = await HealthRepository.checkDatabaseConnection();

    return {
      appName: env.APP_NAME,
      version: '1.0.0',
      environment: env.NODE_ENV,
      uptime: `${process.uptime().toFixed(2)}s`,
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected',
    };
  }
}
