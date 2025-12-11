import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// Helper function to convert BigInt values to numbers/strings for JSON serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === "bigint") return obj.toString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = serializeBigInt(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const rawId = (id ?? "").trim()
    console.log(`[v0] [Document API] Fetching document with raw ID: "${rawId}"`)

    if (!rawId) {
      console.log("[v0] [Document API] Missing document ID")
      return NextResponse.json({ success: false, error: "Missing document id" }, { status: 400 })
    }

    const isNumeric = /^[0-9]+$/.test(rawId)
    const isUuidLike = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawId)

    // Toggle to true to temporarily ignore deleted_at for debugging (remove later)
    const TEST_IGNORE_SOFT_DELETE = true

    const whereClause = TEST_IGNORE_SOFT_DELETE ? "" : "AND deleted_at IS NULL"
    let sql: string
    let paramsArr: any[]

    if (isNumeric) {
      sql = `SELECT * FROM documents WHERE id = $1 ${whereClause} LIMIT 1`
      paramsArr = [Number.parseInt(rawId, 10)]
    } else if (isUuidLike) {
      sql = `SELECT * FROM documents WHERE lower(document_id::text) = $1 ${whereClause} LIMIT 1`
      paramsArr = [rawId.toLowerCase()]
    } else {
      sql = `SELECT * FROM documents WHERE (lower(document_id::text) = $1 OR id::text = $1) ${whereClause} LIMIT 1`
      paramsArr = [rawId.toLowerCase()]
    }

    console.log("[v0] [Document API] SQL:", sql)
    console.log("[v0] [Document API] Params:", paramsArr)

    const result = await query(sql, paramsArr)
    console.log("[v0] [Document API] SQL returned rows:", result.rows.length)

    if (result.rows.length === 0) {
      console.log(`[v0] [Document API] Document not found: ${rawId}`)
      return NextResponse.json({ success: false, error: "Document not found or access denied" }, { status: 404 })
    }

    const document = result.rows[0]
    console.log(`[v0] [Document API] Found document: ${document.filename} (id=${document.id})`)

    const serializedDocument = serializeBigInt(document)
    console.log(`[v0] [Document API] Successfully serialized document`)

    return NextResponse.json({ success: true, document: serializedDocument })
  } catch (err) {
    console.error("[v0] [Document API] Error fetching document:", err)
    console.error("[v0] [Document API] Error stack:", err instanceof Error ? err.stack : "No stack trace")
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 },
    )
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
