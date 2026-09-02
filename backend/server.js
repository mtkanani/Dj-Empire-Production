import http from 'http';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { prisma } from './src/config/prisma.js';
import { initSocket } from './src/modules/realtime/socket.js';
import { InventoryService } from './src/modules/ticketing/services/inventory.service.js';

let server;
let expiryWorkerInterval;

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err?.message,
    stack: err?.stack,
  });

  process.exit(1);
});

// Start HTTP Server Immediately
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
    // Start listening BEFORE waiting for Prisma.
    server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(
        `Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`
      );

      logger.info('Swagger OpenAPI Docs: /api-docs');

      logger.info(
        `Health Endpoint: /api/${env.API_VERSION}/health`
      );
    });

    // Handle HTTP Server Errors
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

    // Connect Prisma after HTTP server has started
    try {
      logger.info('Connecting to database via Prisma...');
      console.log('=== MONGODB TCP TEST START ===');

const mongoHosts = [
  'ac-tkhomxr-shard-00-00.88ywdkx.mongodb.net',
  'ac-tkhomxr-shard-00-01.88ywdkx.mongodb.net',
  'ac-tkhomxr-shard-00-02.88ywdkx.mongodb.net',
];

for (const host of mongoHosts) {
  await new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(5000);

    socket.on('connect', () => {
      console.log(`=== TCP SUCCESS: ${host}:27017 ===`);
      socket.destroy();
      resolve();
    });

    socket.on('timeout', () => {
      console.error(`=== TCP TIMEOUT: ${host}:27017 ===`);
      socket.destroy();
      resolve();
    });

    socket.on('error', (error) => {
      console.error(
        `=== TCP FAILED: ${host}:27017 ===`,
        error?.message
      );
      resolve();
    });

    socket.connect(27017, host);
  });
}

console.log('=== MONGODB TCP TEST END ===');

console.log('=== STARTUP TEST: attempting Prisma connection ===');

      await prisma.$connect();

      logger.info('Database connected successfully via Prisma');

      // Start background worker only after database connection
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

      // Keep HTTP server alive so health endpoint remains accessible.
      // Database-dependent API requests should fail through normal
      // application error handling.
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

// Handle Unhandled Promise Rejections
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

// Graceful Shutdown
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
