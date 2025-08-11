import { PrismaClient } from '../../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Singleton PrismaClient
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

// Prevents new PrismaClient() from creating new instance with each server reload
if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}
