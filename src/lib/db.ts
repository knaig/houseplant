import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'], // Reduced logging for performance
    // Performance optimizations
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling and performance optimizations
    transactionOptions: {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
