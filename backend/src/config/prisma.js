import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

// Singleton instance wrapper for PrismaClient
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Prisma Query: ${e.query} | Duration: ${e.duration}ms`);
  });
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
