import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  return user.id
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Row Data API] Update request received')

    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
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
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('extraction_result')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

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
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        extraction_result: extractionResult,
        updated_at: new Date().toISOString(),
      })
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError || !updatedDocument) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    console.log('[Row Data API] Row data saved successfully')

    return NextResponse.json(
      {
        success: true,
        document: updatedDocument,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[Row Data API] Error saving row data:', error)

    return NextResponse.json(
      {
        error: 'Failed to save row data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
