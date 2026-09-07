import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import prisma from './config/database';

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Listening on 0.0.0.0:${config.port}`);
      logger.info(`API: http://0.0.0.0:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
