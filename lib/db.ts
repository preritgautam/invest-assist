import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient | null }

const isDatabaseAvailable = () => {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL
    return !!dbUrl && dbUrl.length > 0 && !dbUrl.includes("your-database-url")
  } catch (error) {
    console.error("[v0] Error checking database availability:", error)
    return false
  }
}

export const prisma = (() => {
  try {
    if (!isDatabaseAvailable()) {
      console.log("[v0] Database not available, prisma client set to null")
      return null
    }

    return (
      globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      })
    )
  } catch (error) {
    console.error("[v0] Error initializing Prisma client:", error)
    return null
  }
})()

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma
}

// Legacy query function for backward compatibility with existing code
export async function query(sql: string, params?: any[]) {
  if (!prisma) {
    console.log("[v0] Database not available in query(), returning empty result")
    return {
      rows: [],
      rowCount: 0,
    }
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
    console.error("[v0] SQL that failed:", sql)
    console.error("[v0] Params:", params)
    // Return empty result on error
    return {
      rows: [],
      rowCount: 0,
    }
  }
}

export default prisma
