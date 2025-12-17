import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

// GET /api/properties - List all properties for user's company
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: properties, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      properties,
      total: count,
      limit,
      offset,
    }, { status: 200 })

  } catch (error) {
    console.error('[Properties API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
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
    const {
      name,
      address,
      city,
      state,
      zip_code,
      status = 'processing',
      thumbnail_url,
      offer_price,
      cap_rate,
      units,
      year_built,
      occupancy,
      avg_sqft_per_unit,
      metadata,
    } = body

    const now = new Date().toISOString()

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        company_id: companyId,
        name: name || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        status,
        thumbnail_url: thumbnail_url || null,
        offer_price: offer_price || null,
        cap_rate: cap_rate || null,
        units: units || null,
        year_built: year_built || null,
        occupancy: occupancy || null,
        avg_sqft_per_unit: avg_sqft_per_unit || null,
        metadata: metadata || {},
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    console.log('[Properties API] Created property:', property.id)

    return NextResponse.json({ success: true, property }, { status: 201 })

  } catch (error) {
    console.error('[Properties API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
