import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient | null }

const isDatabaseAvailable = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL
  return !!dbUrl && dbUrl.length > 0 && !dbUrl.includes("your-database-url")
}

export const prisma = isDatabaseAvailable()
  ? globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
  : null

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma
}

// Legacy query function for backward compatibility with existing code
export async function query(sql: string, params?: any[]) {
  if (!prisma) {
    console.log("[v0] Database not available, returning empty result")
    throw new Error("Database not available in v0 environment")
  }

  try {
    // Use Prisma's raw query capability
    const result = await prisma.$queryRawUnsafe(sql, ...(params || []))

    // Format to match the expected pg-style response
    return {
      rows: Array.isArray(result) ? result : [result],
      rowCount: Array.isArray(result) ? result.length : 1,
    }
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

export default prisma
