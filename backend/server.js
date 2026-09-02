import http from 'http';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { prisma } from './src/config/prisma.js';
import { initSocket } from './src/modules/realtime/socket.js';
import { InventoryService } from './src/modules/ticketing/services/inventory.service.js';

let server;
let expiryWorkerInterval;

// ============================================================
// UNCAUGHT EXCEPTION HANDLER
// ============================================================

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    error: err?.message,
    stack: err?.stack,
  });

  process.exit(1);
});

// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {
  try {
    logger.info(`Starting server in [${env.NODE_ENV}] mode`);
    logger.info(`Configured port: ${env.PORT}`);

    // ----------------------------------------------------------
    // CREATE HTTP SERVER
    // ----------------------------------------------------------

    const httpServer = http.createServer(app);

    // ----------------------------------------------------------
    // INITIALIZE SOCKET.IO
    // ----------------------------------------------------------

    initSocket(httpServer);

    logger.info('Socket.IO Real-Time Engine initialized');

    // ----------------------------------------------------------
    // START HTTP SERVER IMMEDIATELY
    //
    // IMPORTANT:
    // Hostinger must receive the listen() call quickly.
    // Do not wait for MongoDB before starting the server.
    // ----------------------------------------------------------

    server = httpServer.listen(
      env.PORT,
      '0.0.0.0',
      () => {
        logger.info(
          `Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`
        );

        logger.info('Swagger OpenAPI Docs: /api-docs');

        logger.info(
          `Health Endpoint: /api/${env.API_VERSION}/health`
        );
      }
    );

    // ----------------------------------------------------------
    // HTTP SERVER ERROR HANDLER
    // ----------------------------------------------------------

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

    // ==========================================================
    // PRISMA DATABASE CONNECTION
    // ==========================================================

    try {
      logger.info(
        'Connecting to database via Prisma...'
      );

      await prisma.$connect();

      logger.info(
        'Database connected successfully via Prisma'
      );

      // --------------------------------------------------------
      // START SEAT EXPIRATION WORKER
      // --------------------------------------------------------

      expiryWorkerInterval = setInterval(async () => {
        try {
          await InventoryService.releaseExpiredSeats();
        } catch (err) {
          logger.error(
            `Error in seat hold release worker: ${err?.message}`
          );
        }
      }, 30000);

      logger.info(
        'Seat expiration worker started'
      );
    } catch (dbError) {
      logger.error(
        'Database connection failed via Prisma:',
        {
          message: dbError?.message,
          name: dbError?.name,
          code: dbError?.code,
          stack: dbError?.stack,
        }
      );

      // IMPORTANT:
      // Do NOT terminate the HTTP server.
      // This keeps the application alive even if
      // MongoDB/Prisma temporarily has a problem.
    }
  } catch (error) {
    logger.error(
      'Failed to start server:',
      {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        stack: error?.stack,
      }
    );

    process.exit(1);
  }
};

// ============================================================
// START APPLICATION
// ============================================================

startServer();

// ============================================================
// UNHANDLED PROMISE REJECTION
// ============================================================

process.on('unhandledRejection', (err) => {
  logger.error(
    'UNHANDLED REJECTION! Shutting down...',
    {
      error: err?.message,
      stack: err?.stack,
    }
  );

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

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const gracefulShutdown = (signal) => {
  logger.info(
    `Received ${signal}. Shutting down gracefully...`
  );

  // Stop seat expiration worker
  if (expiryWorkerInterval) {
    clearInterval(expiryWorkerInterval);
  }

  // Close HTTP server
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

// ============================================================
// SHUTDOWN SIGNALS
// ============================================================

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});
