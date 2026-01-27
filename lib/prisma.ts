import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Проверяем, есть ли DATABASE_URL - критично для сборки на Vercel
const hasDatabaseUrl = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.length > 0

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  return client
}

// Создаем заглушку для случаев, когда DATABASE_URL отсутствует (только для сборки)
const createPrismaStub = (): PrismaClient => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'DATABASE_URL is not set. Please configure your database connection in Vercel. ' +
      'See VERCEL_DATABASE_SETUP.md for instructions.'
    )
  }
  // В development возвращаем клиент, но он не будет работать без DATABASE_URL
  return createPrismaClient()
}

export const prisma: PrismaClient = hasDatabaseUrl
  ? (globalForPrisma.prisma ?? createPrismaClient())
  : createPrismaStub()

if (process.env.NODE_ENV !== 'production' && hasDatabaseUrl) {
  globalForPrisma.prisma = prisma
}
