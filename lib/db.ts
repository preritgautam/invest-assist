import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma Client
declare global {
  var prismaInstance: PrismaClient | undefined
}

const isDatabaseAvailable = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL
  const isAvailable = !!dbUrl && dbUrl.length > 0 && !dbUrl.includes("your-database-url")
  console.log("[v0] [DB] Database available:", isAvailable)
  if (isAvailable) {
    console.log("[v0] [DB] Using:", dbUrl.includes("prisma") ? "Prisma Accelerate" : "Direct Database URL")
  }
  return isAvailable
}

let prismaClientInstance: PrismaClient | null = null

const initializePrisma = (): PrismaClient | null => {
  // Return existing instance if already initialized
  if (prismaClientInstance !== null) {
    return prismaClientInstance
  }

  try {
    if (!isDatabaseAvailable()) {
      console.error("[v0] [DB] Database URL not configured")
      return null
    }

    console.log("[v0] [DB] Initializing Prisma client...")
    prismaClientInstance = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })

    console.log("[v0] [DB] Prisma client initialized successfully")
    return prismaClientInstance
  } catch (error) {
    console.error("[v0] [DB] Failed to initialize Prisma:", error)
    return null
  }
}

// Use getter pattern to lazily initialize Prisma
export const prisma: PrismaClient | null = initializePrisma()

if (process.env.NODE_ENV !== "production" && prisma) {
  global.prismaInstance = prisma
}

// Legacy query function for backward compatibility with existing code
export async function query(sql: string, params?: any[]) {
  if (!prisma) {
    console.error("[v0] [DB] CRITICAL: Prisma not initialized!")
    throw new Error("Database connection not available")
  }

  try {
    console.log("[v0] [DB] Executing query:", sql.substring(0, 100) + "...")
    
    // Use Prisma's raw query capability
    const result = await prisma.$queryRawUnsafe(sql, ...(params || []))

    const rowCount = Array.isArray(result) ? result.length : 1
    console.log("[v0] [DB] Query successful, returned", rowCount, "row(s)")

    // Format to match the expected pg-style response
    return {
      rows: Array.isArray(result) ? result : [result],
      rowCount: rowCount,
    }
  } catch (error) {
    console.error("[v0] [DB] Query failed!")
    console.error("[v0] [DB] SQL:", sql)
    console.error("[v0] [DB] Params:", params)
    console.error("[v0] [DB] Error:", error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error) {
      console.error("[v0] [DB] Stack:", error.stack)
    }
    
    // Re-throw the error so the calling code can handle it
    throw error
  }
}

export default prisma
