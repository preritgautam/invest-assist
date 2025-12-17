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
    console.log('[Floor Plans API] Update request received')

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
      floorPlansData,
    } = body

    console.log('[Floor Plans API] Received data:', {
      documentId,
      floorPlansCount: Object.keys(floorPlansData?.floor_plans || {}).length,
    })

    // Validate required fields
    if (!documentId || !floorPlansData) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, floorPlansData' },
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

    // Deep merge: update floor_plans in the metadata while keeping everything else intact
    if (!extractionResult.data) {
      extractionResult.data = {}
    }
    if (!extractionResult.data.metadataMappings) {
      extractionResult.data.metadataMappings = {}
    }

    // Update only the floor_plans in Floor Plan Analysis
    extractionResult.data.metadataMappings['Floor Plan Analysis'] = {
      floor_plans: floorPlansData.floor_plans,
    }

    console.log('[Floor Plans API] Updating document with modified floor plans')

    // Update the document with the modified extraction_result
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

    console.log('[Floor Plans API] Floor plan changes saved to document successfully')

    return NextResponse.json(
      {
        success: true,
        document: updatedDocument,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[Floor Plans API] Error saving floor plans:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save floor plans',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
