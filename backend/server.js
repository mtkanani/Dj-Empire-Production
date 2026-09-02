import http from 'http';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { prisma } from './src/config/prisma.js';
import { initSocket } from './src/modules/realtime/socket.js';
import { InventoryService } from './src/modules/ticketing/services/inventory.service.js';

let server;
let expiryWorkerInterval;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err?.message,
    stack: err?.stack,
  });

  process.exit(1);
});

const startServer = async () => {
  try {
    logger.info(`Starting server in [${env.NODE_ENV}] mode`);
    logger.info(`Configured port: ${env.PORT}`);

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    initSocket(httpServer);

    logger.info('Socket.IO Real-Time Engine initialized');

    // IMPORTANT:
    // Start HTTP server BEFORE waiting for Prisma.
    server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(
        `Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`
      );

      logger.info('Swagger OpenAPI Docs: /api-docs');

      logger.info(
        `Health Endpoint: /api/${env.API_VERSION}/health`
      );
    });

    // Handle HTTP server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(
          `Port ${env.PORT} is already in use by another process.`
        );
      } else {
        logger.error('HTTP Server Error:', {
          message: err?.message,
          stack: err?.stack,
        });
      }

      process.exit(1);
    });

    // Connect to database AFTER HTTP server starts.
    // This prevents Hostinger from killing the app
    // while Prisma is establishing the MongoDB connection.
    try {
      logger.info('Connecting to database via Prisma...');

      await prisma.$connect();

      logger.info('Database connected successfully via Prisma');

      // Start seat expiration worker after DB connection
      expiryWorkerInterval = setInterval(async () => {
        try {
          await InventoryService.releaseExpiredSeats();
        } catch (err) {
          logger.error(
            `Error in seat hold release worker: ${err?.message}`
          );
        }
      }, 30000);

      logger.info('Seat expiration worker started');
    } catch (dbError) {
      logger.error('Database connection failed:', {
        message: dbError?.message,
        name: dbError?.name,
        code: dbError?.code,
        stack: dbError?.stack,
      });

      // Do NOT exit the process.
      // The HTTP server must remain alive.
    }
  } catch (error) {
    logger.error('Failed to start server:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
    });

    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    error: err?.message,
    stack: err?.stack,
  });

  if (server) {
    server.close(async () => {
      if (expiryWorkerInterval) {
        clearInterval(expiryWorkerInterval);
      }

      await prisma.$disconnect().catch(() => {});

      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  if (expiryWorkerInterval) {
    clearInterval(expiryWorkerInterval);
  }

  if (server) {
    server.close(async () => {
      await prisma.$disconnect().catch(() => {});

      logger.info(
        'HTTP server and Database connection closed.'
      );

      process.exit(0);
    });
  } else {
    prisma
      .$disconnect()
      .catch(() => {})
      .finally(() => {
        process.exit(0);
      });
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
