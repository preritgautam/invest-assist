import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma Client
declare global {
  var prismaInstance: PrismaClient | undefined
}

const isDatabaseAvailable = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL
  const isAvailable = !!dbUrl && dbUrl.length > 0 && !dbUrl.includes("your-database-url")
  console.log("[v0] [DB] Database available:", isAvailable, "URL:", dbUrl ? dbUrl.substring(0, 50) + "..." : "none")
  return isAvailable
}

export const prisma: PrismaClient | null = isDatabaseAvailable()
  ? global.prismaInstance || new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
  : null

if (process.env.NODE_ENV !== "production" && prisma) {
  global.prismaInstance = prisma
}

// Legacy query function for backward compatibility with existing code
export async function query(sql: string, params?: any[]) {
  if (!prisma) {
    console.log("[v0] [DB] Prisma not available, returning empty result")
    return {
      rows: [],
      rowCount: 0,
    }
  }

  try {
    console.log("[v0] [DB] Executing query:", sql, "Params:", params)
    
    // Use Prisma's raw query capability
    const result = await prisma.$queryRawUnsafe(sql, ...(params || []))

    console.log("[v0] [DB] Query result rows:", Array.isArray(result) ? result.length : 1)

    // Format to match the expected pg-style response
    return {
      rows: Array.isArray(result) ? result : [result],
      rowCount: Array.isArray(result) ? result.length : 1,
    }
  } catch (error) {
    console.error("[v0] [DB] Database query error:", error instanceof Error ? error.message : error)
    console.error("[v0] [DB] Error details:", error)
    // Return empty result on error
    return {
      rows: [],
      rowCount: 0,
    }
  }
}

export default prisma
