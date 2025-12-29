import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type PropertyAssumptionsInsert = Database['public']['Tables']['property_assumptions']['Insert']

/**
 * GET /api/properties/[id]/assumptions
 * Fetches saved assumptions for a property
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'User not associated with a company' }, { status: 400 })
    }

    // Fetch assumptions
    const { data, error } = await supabase
      .from('property_assumptions')
      .select('*')
      .eq('property_id', propertyId)
      .eq('company_id', userData.company_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[Assumptions API] Error fetching assumptions:', error)
      return NextResponse.json({ error: 'Failed to fetch assumptions' }, { status: 500 })
    }

    // Transform snake_case to camelCase for frontend
    const assumptions = data ? {
      // Deal Overview
      purchasePrice: data.purchase_price,
      holdPeriod: data.hold_period,
      reversionCapRate: data.reversion_cap_rate,
      exitCostsPercent: data.exit_costs_percent,
      // Market & Income
      rentGrowth: data.rent_growth,
      vacancyPercent: data.vacancy_percent,
      creditLossPercent: data.credit_loss_percent,
      concessionsPercent: data.concessions_percent,
      otherIncomeGrowth: data.other_income_growth,
      // Expenses
      managementFeePercent: data.management_fee_percent,
      payrollPerUnit: data.payroll_per_unit,
      repairsPerUnit: data.repairs_per_unit,
      utilitiesPerUnit: data.utilities_per_unit,
      insurancePerUnit: data.insurance_per_unit,
      marketingPerUnit: data.marketing_per_unit,
      contractServicesPerUnit: data.contract_services_per_unit,
      replacementReservesPerUnit: data.replacement_reserves_per_unit,
      expenseInflation: data.expense_inflation,
      // Capital & Debt
      loanAmount: data.loan_amount,
      ltvPercent: data.ltv_percent,
      interestRate: data.interest_rate,
      amortizationYears: data.amortization_years,
      loanTermYears: data.loan_term_years,
      interestOnlyYears: data.interest_only_years,
      dscrTarget: data.dscr_target,
      initialReserves: data.initial_reserves,
      capexReservePerUnit: data.capex_reserve_per_unit,
      // Status
      isFrozen: data.is_frozen,
      frozenAt: data.frozen_at,
    } : null

    return NextResponse.json({ 
      data: assumptions,
      isFrozen: data?.is_frozen || false
    })
  } catch (error) {
    console.error('[Assumptions API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/properties/[id]/assumptions
 * Save or update assumptions for a property
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'User not associated with a company' }, { status: 400 })
    }

    const companyId = userData.company_id

    // Check if assumptions exist and are frozen
    const { data: existing, error: checkError } = await supabase
      .from('property_assumptions')
      .select('id, is_frozen')
      .eq('property_id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Assumptions API] Check error:', checkError)
    }

    // If frozen and not trying to unfreeze, reject the update
    if (existing?.is_frozen && !body.unfreeze) {
      return NextResponse.json(
        { error: 'Assumptions are frozen. Unfreeze to make changes.' },
        { status: 403 }
      )
    }

    // Transform camelCase to snake_case for database
    const dbData: PropertyAssumptionsInsert = {
      property_id: propertyId,
      company_id: companyId,
      // Deal Overview
      purchase_price: body.purchasePrice,
      hold_period: body.holdPeriod,
      reversion_cap_rate: body.reversionCapRate,
      exit_costs_percent: body.exitCostsPercent,
      // Market & Income
      rent_growth: body.rentGrowth,
      vacancy_percent: body.vacancyPercent,
      credit_loss_percent: body.creditLossPercent,
      concessions_percent: body.concessionsPercent,
      other_income_growth: body.otherIncomeGrowth,
      // Expenses
      management_fee_percent: body.managementFeePercent,
      payroll_per_unit: body.payrollPerUnit,
      repairs_per_unit: body.repairsPerUnit,
      utilities_per_unit: body.utilitiesPerUnit,
      insurance_per_unit: body.insurancePerUnit,
      marketing_per_unit: body.marketingPerUnit,
      contract_services_per_unit: body.contractServicesPerUnit,
      replacement_reserves_per_unit: body.replacementReservesPerUnit,
      expense_inflation: body.expenseInflation,
      // Capital & Debt
      loan_amount: body.loanAmount,
      ltv_percent: body.ltvPercent,
      interest_rate: body.interestRate,
      amortization_years: body.amortizationYears,
      loan_term_years: body.loanTermYears,
      interest_only_years: body.interestOnlyYears,
      dscr_target: body.dscrTarget,
      initial_reserves: body.initialReserves,
      capex_reserve_per_unit: body.capexReservePerUnit,
      // Updated by
      updated_by: user.id,
    }

    // Handle freeze/unfreeze
    if (body.freeze) {
      dbData.is_frozen = true
      dbData.frozen_at = new Date().toISOString()
      dbData.frozen_by = user.id
    } else if (body.unfreeze) {
      dbData.is_frozen = false
      dbData.frozen_at = null
      dbData.frozen_by = null
    }

    let result
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('property_assumptions')
        .update(dbData)
        .eq('property_id', propertyId)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('[Assumptions API] Update error:', error)
        return NextResponse.json(
          { error: 'Failed to update assumptions', details: error.message },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Insert new record
      dbData.created_by = user.id
      const { data, error } = await supabase
        .from('property_assumptions')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        console.error('[Assumptions API] Insert error:', error)
        return NextResponse.json(
          { error: 'Failed to save assumptions', details: error.message },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      isFrozen: result.is_frozen
    })
  } catch (error) {
    console.error('[Assumptions API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
