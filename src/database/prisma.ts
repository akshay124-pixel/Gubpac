import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Log warnings and errors
prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});
