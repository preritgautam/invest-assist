import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OMExtractionResult } from '@/lib/supabase/database.types'

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Helper to get user's company_id
async function getUserCompanyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: userData, error } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single()

  if (error || !userData?.company_id) {
    return null
  }
  return userData.company_id
}

// GET /api/properties/[id]/om-data - Get OM extraction data for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    // Validate UUID format to handle mock data gracefully
    if (!isValidUUID(propertyId)) {
      console.log(`[OM Data API] Non-UUID propertyId: ${propertyId} (likely mock data)`)
      return NextResponse.json({
        success: true,
        propertyId,
        propertyName: 'Mock Property',
        hasOMData: false,
        omExtraction: null,
        message: 'Mock property - no OM data in database',
      }, { status: 200 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = await getUserCompanyId(supabase, user.id)

    if (!companyId) {
      return NextResponse.json(
        { error: 'User has no company' },
        { status: 403 }
      )
    }

    // Get property with metadata (which contains om_extraction)
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, name, metadata')
      .eq('id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if OM extraction data exists in metadata
    const metadata = property.metadata as { om_extraction?: OMExtractionResult; om_extracted_at?: string } | null

    if (!metadata?.om_extraction) {
      // Try to find from documents table
      const { data: omDocument, error: docError } = await supabase
        .from('documents')
        .select('extraction_result, document_type, filename, created_at')
        .eq('property_id', propertyId)
        .eq('company_id', companyId)
        .eq('document_type', 'offering_memorandum')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (docError || !omDocument) {
        return NextResponse.json({
          success: true,
          propertyId,
          propertyName: property.name,
          hasOMData: false,
          omExtraction: null,
          message: 'No OM document found for this property',
        }, { status: 200 })
      }

      // Extract OM data from document extraction_result
      const extractionResult = omDocument.extraction_result as {
        om_extraction?: OMExtractionResult;
        classification?: unknown;
      } | null

      if (!extractionResult?.om_extraction) {
        return NextResponse.json({
          success: true,
          propertyId,
          propertyName: property.name,
          hasOMData: false,
          omExtraction: null,
          documentFilename: omDocument.filename,
          message: 'OM document found but no extraction data available',
        }, { status: 200 })
      }

      return NextResponse.json({
        success: true,
        propertyId,
        propertyName: property.name,
        hasOMData: true,
        omExtraction: extractionResult.om_extraction,
        documentFilename: omDocument.filename,
        extractedAt: omDocument.created_at,
        source: 'document',
      }, { status: 200 })
    }

    // Return OM data from property metadata
    return NextResponse.json({
      success: true,
      propertyId,
      propertyName: property.name,
      hasOMData: true,
      omExtraction: metadata.om_extraction,
      extractedAt: metadata.om_extracted_at,
      source: 'property_metadata',
    }, { status: 200 })

  } catch (error) {
    console.error('[OM Data API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
