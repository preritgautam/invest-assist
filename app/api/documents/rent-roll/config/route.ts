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
    console.log('[Rent Roll Config API] Update request received')

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
      tenantChargesData,
      occupancyMappingsData,
    } = body

    console.log('[Rent Roll Config API] Received data:', {
      documentId,
      tenantChargesCount: Object.keys(tenantChargesData || {}).length,
      occupancyMappingsCount: Object.keys(occupancyMappingsData || {}).length,
    })

    // Validate required fields
    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing required field: documentId' },
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

    // Deep merge: update config in the metadata while keeping everything else intact
    if (!extractionResult.data) {
      extractionResult.data = {}
    }
    if (!extractionResult.data.metadataMappings) {
      extractionResult.data.metadataMappings = {}
    }

    // Update tenant charges configuration - preserve all original categories
    if (tenantChargesData) {
      // Get existing mapping to preserve original category structure
      const existingMapping = extractionResult.data.metadataMappings['Mapping for the charges'] || {}

      // Create merged mapping that preserves all original categories
      const mergedMapping: Record<string, string[]> = {}

      // First, initialize all original categories with empty arrays
      Object.keys(existingMapping).forEach(category => {
        mergedMapping[category] = []
      })

      // Then apply the new mappings from the request
      Object.entries(tenantChargesData).forEach(([category, codes]) => {
        mergedMapping[category] = Array.isArray(codes) ? codes : []
      })

      // Keep all original categories, even if they end up empty after remapping
      extractionResult.data.metadataMappings['Mapping for the charges'] = mergedMapping

      console.log('[Rent Roll Config API] Updated mapping for the charges:', mergedMapping)
    }

    // Update occupancy mappings configuration
    if (occupancyMappingsData) {
      if (!extractionResult.data.metadataMappings['Occupancy Mapping']) {
        extractionResult.data.metadataMappings['Occupancy Mapping'] = {}
      }
      // Preserve validation field if it exists
      const existingValidation = extractionResult.data.metadataMappings['Occupancy Mapping'].validation
      extractionResult.data.metadataMappings['Occupancy Mapping'] = {
        ...occupancyMappingsData,
        ...(existingValidation ? { validation: existingValidation } : {}),
      }
    }

    console.log('[Rent Roll Config API] Updating document with modified configurations')

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

    console.log('[Rent Roll Config API] Rent roll configurations saved to document successfully')

    return NextResponse.json(
      {
        success: true,
        document: updatedDocument,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[Rent Roll Config API] Error saving configurations:', error)

    return NextResponse.json(
      {
        error: 'Failed to save configurations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
