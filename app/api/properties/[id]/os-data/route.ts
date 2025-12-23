import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// OS Extraction Result interface (matches the os-extract route output)
interface MonthlyData {
  jan: number
  feb: number
  mar: number
  apr: number
  may: number
  jun: number
  jul: number
  aug: number
  sep: number
  oct: number
  nov: number
  dec: number
}

interface LineItem {
  id: string
  name: string
  annualAmount: number
  perUnit: number
  notes: string
  isExpanded?: boolean
  isCalculated?: boolean
  hasChildren?: boolean
  hasFormula?: boolean
  formula?: string
  docTotal?: number
  monthlyData?: MonthlyData
  label?: string
  isMajorTotal?: boolean
  children?: LineItem[]
}

interface OSExtractionResult {
  property_info: {
    property_name: string | null
    total_units: number | null
    period_start: string | null
    period_end: string | null
    fiscal_year: number | null
  }
  income_items: LineItem[]
  expense_items: LineItem[]
  capital_items: LineItem[]
  debt_items: LineItem[]
  summary: {
    effective_gross_income: number | null
    total_operating_expenses: number | null
    net_operating_income: number | null
    total_capital_expenses: number | null
    total_debt_service: number | null
    cash_flow_after_debt: number | null
  }
}

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

// GET /api/properties/[id]/os-data - Get OS/T-12 extraction data for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    // Validate UUID format to handle mock data gracefully
    if (!isValidUUID(propertyId)) {
      console.log(`[OS Data API] Non-UUID propertyId: ${propertyId} (likely mock data)`)
      return NextResponse.json({
        success: true,
        propertyId,
        propertyName: 'Mock Property',
        hasOSData: false,
        osExtraction: null,
        message: 'Mock property - no OS data in database',
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

    // Get property with metadata (which may contain os_extraction)
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

    // Check if OS extraction data exists in metadata
    const metadata = property.metadata as { os_extraction?: OSExtractionResult; os_extracted_at?: string } | null

    if (!metadata?.os_extraction) {
      // Try to find from documents table - check for both operating_statement and t12 types
      const { data: osDocument, error: docError } = await supabase
        .from('documents')
        .select('extraction_result, document_type, filename, created_at')
        .eq('property_id', propertyId)
        .eq('company_id', companyId)
        .in('document_type', ['operating_statement', 't12'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (docError || !osDocument) {
        return NextResponse.json({
          success: true,
          propertyId,
          propertyName: property.name,
          hasOSData: false,
          osExtraction: null,
          message: 'No Operating Statement / T-12 document found for this property',
        }, { status: 200 })
      }

      // Extract OS data from document extraction_result
      const extractionResult = osDocument.extraction_result as OSExtractionResult | null

      if (!extractionResult || !extractionResult.income_items) {
        return NextResponse.json({
          success: true,
          propertyId,
          propertyName: property.name,
          hasOSData: false,
          osExtraction: null,
          documentFilename: osDocument.filename,
          message: 'OS document found but no extraction data available',
        }, { status: 200 })
      }

      return NextResponse.json({
        success: true,
        propertyId,
        propertyName: property.name,
        hasOSData: true,
        osExtraction: extractionResult,
        documentFilename: osDocument.filename,
        extractedAt: osDocument.created_at,
        source: 'document',
      }, { status: 200 })
    }

    // Return OS data from property metadata
    return NextResponse.json({
      success: true,
      propertyId,
      propertyName: property.name,
      hasOSData: true,
      osExtraction: metadata.os_extraction,
      extractedAt: metadata.os_extracted_at,
      source: 'property_metadata',
    }, { status: 200 })

  } catch (error) {
    console.error('[OS Data API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
