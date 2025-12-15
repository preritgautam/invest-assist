import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// CLERK BYPASSED - using mock user ID for v0 Vercel compatibility
const MOCK_USER_ID = 'user_bypass_12345'

// Helper function to convert BigInt values to numbers/strings for JSON serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return obj.toString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = serializeBigInt(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Row Data API] Update request received')

    const userId = MOCK_USER_ID
    const body = await request.json()

    const {
      documentId,
      rowIndex,
      columnName,
      newValue,
    } = body

    console.log('[Row Data API] Received data:', {
      documentId,
      rowIndex,
      columnName,
      newValue,
    })

    // Validate required fields
    if (!documentId || rowIndex === undefined || !columnName || newValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, rowIndex, columnName, newValue' },
        { status: 400 }
      )
    }

    // Fetch the existing document
    const existingDocResult = await query(
      `SELECT extraction_result FROM documents 
       WHERE document_id = $1 AND user_id = $2`,
      [documentId, userId]
    )

    if (existingDocResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const existingDoc = existingDocResult.rows[0]
    const extractionResult = existingDoc.extraction_result || {}

    // Ensure nested structure exists
    if (!extractionResult.data) {
      extractionResult.data = {}
    }
    if (!extractionResult.data.extraction) {
      extractionResult.data.extraction = { units: [], headers: [] }
    }

    // Get the units array
    const units = extractionResult.data.extraction.units || []
    const headers = extractionResult.data.extraction.headers || []

    // Validate row index
    if (rowIndex < 0 || rowIndex >= units.length) {
      return NextResponse.json(
        { error: 'Invalid row index' },
        { status: 400 }
      )
    }

    // Find the column index
    const columnIndex = headers.indexOf(columnName)
    if (columnIndex === -1) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 400 }
      )
    }

    // Update the unit data
    units[rowIndex][columnIndex] = newValue

    console.log('[Row Data API] Updated unit at row', rowIndex, 'column', columnName)

    // Update the document
    const result = await query(
      `UPDATE documents 
       SET extraction_result = $1::jsonb, updated_at = NOW() 
       WHERE document_id = $2 AND user_id = $3 
       RETURNING *`,
      [JSON.stringify(extractionResult), documentId, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    const updatedDocument = result.rows[0]

    console.log('[Row Data API] Row data saved successfully')

    return NextResponse.json(
      {
        success: true,
        document: serializeBigInt(updatedDocument),
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[Row Data API] Error saving row data:', error)

    if (error instanceof Error) {
      console.error('[Row Data API] Error message:', error.message)
      console.error('[Row Data API] Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to save row data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
