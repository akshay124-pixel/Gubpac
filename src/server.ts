import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './database/prisma';
import { redis } from './config/redis';
import { OutboxDispatcher } from './services/outbox.dispatcher';
import app from './app';

const PORT = env.PORT;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connected successfully');

    // Start outbox dispatcher
    const outboxDispatcher = new OutboxDispatcher();
    outboxDispatcher.start();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      
      outboxDispatcher.stop();
      
      server.close(async () => {
        await prisma.$disconnect();
        await redis.quit();
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
