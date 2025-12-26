import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type PropertyAnalysisInsert = Database['public']['Tables']['property_analysis_data']['Insert']

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

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// GET /api/properties/[id]/analysis-data - Get analysis data for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    // Validate UUID format
    if (!isValidUUID(propertyId)) {
      return NextResponse.json({
        success: true,
        propertyId,
        hasData: false,
        data: null,
        message: 'Invalid property ID format',
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

    // Fetch analysis data for this property
    const { data: analysisData, error: fetchError } = await supabase
      .from('property_analysis_data')
      .select('*')
      .eq('property_id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[Analysis Data API] Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch analysis data' },
        { status: 500 }
      )
    }

    // Transform snake_case to camelCase for frontend
    const transformedData = analysisData ? {
      actualRentCollected: analysisData.actual_rent_collected,
      otherIncome: analysisData.other_income,
      totalOperatingExpenses: analysisData.total_operating_expenses,
      propertyTaxes: analysisData.property_taxes,
      insurance: analysisData.insurance,
      totalNOI: analysisData.total_noi,
      unitCount: analysisData.unit_count,
      avgRentPerUnit: analysisData.avg_rent_per_unit,
      marketRentPerUnit: analysisData.market_rent_per_unit,
      occupancyPercent: analysisData.occupancy_percent,
      lossToLeasePercent: analysisData.loss_to_lease_percent,
      vacancyLoss: analysisData.vacancy_loss,
      propertyName: analysisData.property_name,
      yearBuilt: analysisData.year_built,
      squareFootage: analysisData.square_footage,
      marketRentComparable: analysisData.market_rent_comparable,
      isEdited: analysisData.is_edited,
    } : null

    return NextResponse.json({
      success: true,
      propertyId,
      hasData: !!analysisData,
      isEdited: analysisData?.is_edited ?? false,
      data: transformedData,
    }, { status: 200 })

  } catch (error) {
    console.error('[Analysis Data API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/properties/[id]/analysis-data - Create or update analysis data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    // Validate UUID format
    if (!isValidUUID(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID format' },
        { status: 400 }
      )
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

    const body = await request.json()

    // Transform camelCase to snake_case for database
    const dbData: PropertyAnalysisInsert = {
      property_id: propertyId,
      company_id: companyId,
      actual_rent_collected: body.actualRentCollected ?? null,
      other_income: body.otherIncome ?? null,
      total_operating_expenses: body.totalOperatingExpenses ?? null,
      property_taxes: body.propertyTaxes ?? null,
      insurance: body.insurance ?? null,
      total_noi: body.totalNOI ?? null,
      unit_count: body.unitCount ?? null,
      avg_rent_per_unit: body.avgRentPerUnit ?? null,
      market_rent_per_unit: body.marketRentPerUnit ?? null,
      occupancy_percent: body.occupancyPercent ?? null,
      loss_to_lease_percent: body.lossToLeasePercent ?? null,
      vacancy_loss: body.vacancyLoss ?? null,
      property_name: body.propertyName ?? null,
      year_built: body.yearBuilt ?? null,
      square_footage: body.squareFootage ?? null,
      market_rent_comparable: body.marketRentComparable ?? null,
      is_edited: true, // Set to true when user saves
    }

    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from('property_analysis_data')
      .select('id')
      .eq('property_id', propertyId)
      .eq('company_id', companyId)
      .single()

    // Log check result
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Analysis Data API] Check error:', checkError)
    }
    console.log('[Analysis Data API] Existing record:', existing ? 'Yes' : 'No')

    let result
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('property_analysis_data')
        .update(dbData)
        .eq('property_id', propertyId)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('[Analysis Data API] Update error:', error)
        return NextResponse.json(
          { error: 'Failed to update analysis data', details: error.message },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('property_analysis_data')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        console.error('[Analysis Data API] Insert error:', error)
        return NextResponse.json(
          { error: 'Failed to save analysis data' },
          { status: 500 }
        )
      }
      result = data
    }

    console.log('[Analysis Data API] Data saved successfully for property:', propertyId)

    return NextResponse.json({
      success: true,
      propertyId,
      data: result,
    }, { status: 200 })

  } catch (error) {
    console.error('[Analysis Data API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
