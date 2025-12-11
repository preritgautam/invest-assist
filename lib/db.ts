import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Legacy query function for backward compatibility with existing code
export async function query(sql: string, params?: any[]) {
  // Use Prisma's raw query capability
  const result = await prisma.$queryRawUnsafe(sql, ...(params || []))

  // Format to match the expected pg-style response
  return {
    rows: Array.isArray(result) ? result : [result],
    rowCount: Array.isArray(result) ? result.length : 1,
  }
}

export default prisma
