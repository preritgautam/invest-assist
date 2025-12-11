// Legacy database module - now uses Prisma
// This file is kept for backward compatibility
// New code should use Prisma directly from lib/prisma.ts

import { prisma } from './prisma'

// Legacy query function for backward compatibility
// Converts parameterized queries to Prisma's raw query format
export async function query(sql, params = []) {
  console.warn('[Database] Legacy query() method called. Consider migrating to Prisma directly.')
  
  try {
    // Convert parameterized query ($1, $2, etc.) with proper escaping for Prisma
    let queryString = sql
    const values = [...params]
    
    // Replace $1, $2, etc. with actual values, properly escaped
    let paramIndex = 0
    queryString = queryString.replace(/\$(\d+)/g, (match, index) => {
      const idx = parseInt(index) - 1
      const val = values[idx]
      
      // Properly handle different data types
      if (val === null || val === undefined) {
        return 'null'
      }
      if (typeof val === 'boolean') {
        return val ? 'true' : 'false'
      }
      if (typeof val === 'number') {
        return String(val)
      }
      // String values - escape single quotes
      if (typeof val === 'string') {
        return `'${val.replace(/'/g, "''")}'`
      }
      // Objects/arrays - JSON stringify
      return `'${JSON.stringify(val).replace(/'/g, "''")}'`
    })

    console.debug('[Database] Executing raw query:', { sql: queryString.substring(0, 100) })
    
    // Execute the raw query using Prisma
    const result = await prisma.$queryRawUnsafe(queryString)
    
    // Return result in pg-like format for compatibility
    return { 
      rows: Array.isArray(result) ? result : (result ? [result] : []), 
      rowCount: Array.isArray(result) ? result.length : (result ? 1 : 0) 
    }
  } catch (error) {
    console.error('[Database] Query error:', error)
    throw error
  }
}

// Export Prisma client for new code
export { prisma }


