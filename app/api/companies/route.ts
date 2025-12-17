import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/companies - Get current user's company
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.company_id) {
      return NextResponse.json(
        { error: 'User has no company' },
        { status: 404 }
      )
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', userData.company_id)
      .single()

    if (companyError) {
      throw new Error(companyError.message)
    }

    return NextResponse.json({ success: true, company }, { status: 200 })

  } catch (error) {
    console.error('[Companies API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create a new company (admin only, or during signup)
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

    const body = await request.json()
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if user already has a company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userData?.company_id) {
      return NextResponse.json(
        { error: 'User already has a company' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company slug already exists' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name,
        slug,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (companyError) {
      throw new Error(companyError.message)
    }

    // Link user to company
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        company_id: company.id,
        role: 'admin',
        updated_at: now,
      })
      .eq('id', user.id)

    if (userUpdateError) {
      // Rollback company creation
      await supabase.from('companies').delete().eq('id', company.id)
      throw new Error(userUpdateError.message)
    }

    return NextResponse.json({ success: true, company }, { status: 201 })

  } catch (error) {
    console.error('[Companies API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
