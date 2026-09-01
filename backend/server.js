import http from 'http';
import dns from 'dns/promises';
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
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack,
  });

  process.exit(1);
});

// Establish Database Connection and Start HTTP & Real-Time Socket Server
const startServer = async () => {
  try {
    // Test Prisma Database Connection
    console.log('=== STARTUP TEST: server.js loaded ===');
    console.log('=== STARTUP TEST: PORT =', env.PORT);
    console.log('=== STARTUP TEST: NODE_ENV =', env.NODE_ENV);

    console.log('=== NODE DNS TEST START ===');

try {
  const dnsResult = await dns.lookup('cluster0.88ywdkx.mongodb.net', {
    all: true,
  });

  console.log('=== NODE DNS TEST SUCCESS ===');
  console.log(dnsResult);
} catch (dnsError) {
  console.error('=== NODE DNS TEST FAILED ===');
  console.error('Message:', dnsError?.message);
  console.error('Code:', dnsError?.code);
  console.error('Full error:', dnsError);
}

console.log('=== STARTUP TEST: attempting Prisma connection ===');

await prisma.$connect();

    console.log('=== STARTUP TEST: Prisma connected ===');

    logger.info('✅ Database connected successfully via Prisma');

    // Create HTTP server wrapping Express
    const httpServer = http.createServer(app);

    // Initialize Socket.IO Real-Time Engine
    initSocket(httpServer);

    logger.info('⚡ Socket.IO Real-Time Engine initialized');

    // Start HTTP & Socket Server
    console.log('=== STARTUP TEST: starting HTTP server ===');

    server = httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(
        `🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`
      );

      logger.info('📚 Swagger OpenAPI Docs: /api-docs');

      logger.info(
        `⚡ Health Endpoint: /api/${env.API_VERSION}/health`
      );
    });

    // Start background worker for automatic seat hold expiration
    expiryWorkerInterval = setInterval(async () => {
      try {
        await InventoryService.releaseExpiredSeats();
      } catch (err) {
        logger.error(
          `Error in seat hold release worker: ${err.message}`
        );
      }
    }, 30000);

    // Handle HTTP Server Errors
    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(
          `❌ Port ${env.PORT} is already in use by another process.`
        );
      } else {
        logger.error('❌ HTTP Server Error:', err);
      }

      await prisma.$disconnect();
      process.exit(1);
    });
  } catch (error) {
    console.error('========================================');
    console.error('❌ PRISMA / SERVER STARTUP ERROR');
    console.error('Message:', error?.message);
    console.error('Name:', error?.name);
    console.error('Code:', error?.code);
    console.error('Full error:', error);
    console.error('========================================');

    logger.error('Failed to start server:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
    });

    await prisma.$disconnect().catch(() => {});

    process.exit(1);
  }
};

startServer();

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    error: err?.message,
    stack: err?.stack,
  });

  if (server) {
    server.close(async () => {
      clearInterval(expiryWorkerInterval);

      await prisma.$disconnect().catch(() => {});

      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle Graceful Termination Signals
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  if (expiryWorkerInterval) {
    clearInterval(expiryWorkerInterval);
  }

  if (server) {
    server.close(async () => {
      await prisma.$disconnect().catch(() => {});

      logger.info('HTTP server and Database connection closed.');

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
