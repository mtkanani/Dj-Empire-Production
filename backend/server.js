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
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Establish Database Connection and Start HTTP & Real-Time Socket Server
const startServer = async () => {
  try {
    // Test Prisma Database Connection
    // Test Prisma Database Connection
console.log('=== STARTUP TEST: server.js loaded ===');
console.log('=== STARTUP TEST: PORT =', env.PORT);
console.log('=== STARTUP TEST: NODE_ENV =', env.NODE_ENV);

console.log('=== STARTUP TEST: attempting Prisma connection ===');

await prisma.$connect();

console.log('=== STARTUP TEST: Prisma connected ===');

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
    
      logger.info(`📚 Swagger OpenAPI Docs: /api-docs`);
    
      logger.info(
        `⚡ Health Endpoint: /api/${env.API_VERSION}/health`
      );
    });

    // Start background worker for automatic seat hold expiration (every 30s)
    expiryWorkerInterval = setInterval(async () => {
      try {
        await InventoryService.releaseExpiredSeats();
      } catch (err) {
        logger.error(`Error in seat hold release worker: ${err.message}`);
      }
    }, 30000);

    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${env.PORT} is already in use by another process. Please free port ${env.PORT} or stop the other process.`);
      } else {
        logger.error('❌ HTTP Server Error:', err);
      }
      await prisma.$disconnect();
      process.exit(1);
    });
  } } catch (error) {
  console.error('========================================');
  console.error('❌ PRISMA / SERVER STARTUP ERROR');
  console.error('Message:', error?.message);
  console.error('Name:', error?.name);
  console.error('Code:', error?.code);
  console.error('Full error:', error);
  console.error('========================================');

  logger.error('Failed to start server:', error);

  await prisma.$disconnect().catch(() => {});
  process.exit(1);
}
};

startServer();

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { error: err?.message, stack: err?.stack });
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle Graceful Termination Signals
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('HTTP server and Database connection closed.');
      process.exit(0);
    });
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
