import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'

// Types for line items
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

async function getUserId() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  return user.id
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

// Helper function to recursively find and update a line item by id
function updateLineItemById(
  items: LineItem[],
  itemId: string,
  updates: Partial<LineItem>
): { items: LineItem[]; found: boolean } {
  let found = false
  
  const updatedItems = items.map((item) => {
    if (item.id === itemId) {
      found = true
      return { ...item, ...updates }
    }
    if (item.children && item.children.length > 0) {
      const result = updateLineItemById(item.children, itemId, updates)
      if (result.found) {
        found = true
        return { ...item, children: result.items }
      }
    }
    return item
  })

  return { items: updatedItems, found }
}

// POST /api/documents/os-update - Update OS/T-12 line item data
export async function POST(request: NextRequest) {
  try {
    console.log('[OS Update API] Update request received')

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
      propertyId,
      itemId,
      itemType, // 'income' | 'expense' | 'capital' | 'debt'
      updates, // Partial<LineItem> - the fields to update
    } = body

    console.log('[OS Update API] Received data:', {
      propertyId,
      itemId,
      itemType,
      updates,
    })

    // Validate required fields
    if (!propertyId || !itemId || !itemType || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, itemId, itemType, updates' },
        { status: 400 }
      )
    }

    // Validate itemType
    const validItemTypes = ['income', 'expense', 'capital', 'debt']
    if (!validItemTypes.includes(itemType)) {
      return NextResponse.json(
        { error: `Invalid itemType. Must be one of: ${validItemTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch the existing OS document by propertyId and companyId
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('id, document_id, extraction_result')
      .eq('property_id', propertyId)
      .eq('company_id', companyId)
      .in('document_type', ['operating_statement', 't12'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !existingDoc) {
      console.error('[OS Update API] Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    console.log('[OS Update API] Found document with id:', existingDoc.id)

    const extractionResult = existingDoc.extraction_result as unknown as OSExtractionResult

    if (!extractionResult) {
      return NextResponse.json(
        { error: 'No extraction result found in document' },
        { status: 400 }
      )
    }

    // Determine which array to update based on itemType
    let itemsArrayKey: 'income_items' | 'expense_items' | 'capital_items' | 'debt_items'
    switch (itemType) {
      case 'income':
        itemsArrayKey = 'income_items'
        break
      case 'expense':
        itemsArrayKey = 'expense_items'
        break
      case 'capital':
        itemsArrayKey = 'capital_items'
        break
      case 'debt':
        itemsArrayKey = 'debt_items'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid itemType' },
          { status: 400 }
        )
    }

    // Get the items array
    const items = extractionResult[itemsArrayKey] || []

    // Update the line item
    const { items: updatedItems, found } = updateLineItemById(items, itemId, updates)

    if (!found) {
      return NextResponse.json(
        { error: `Line item with id "${itemId}" not found in ${itemType}_items` },
        { status: 404 }
      )
    }

    // Update the extraction result
    extractionResult[itemsArrayKey] = updatedItems

    console.log('[OS Update API] Updated line item:', itemId)

    // Update the document in the database using the primary key id
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        extraction_result: extractionResult as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingDoc.id)
      .select()
      .single()

    if (updateError || !updatedDocument) {
      console.error('[OS Update API] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    // Also update the property metadata if os_extraction exists there
    // This ensures consistency since os-data API may read from either source
    const { data: property } = await supabase
      .from('properties')
      .select('id, metadata')
      .eq('id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (property?.metadata && (property.metadata as { os_extraction?: unknown }).os_extraction) {
      console.log('[OS Update API] Also updating property metadata')
      const currentMetadata = property.metadata as Record<string, unknown>
      const { error: metadataUpdateError } = await supabase
        .from('properties')
        .update({
          metadata: {
            ...currentMetadata,
            os_extraction: extractionResult,
            os_extracted_at: new Date().toISOString(),
          },
        })
        .eq('id', propertyId)
        .eq('company_id', companyId)

      if (metadataUpdateError) {
        console.error('[OS Update API] Metadata update error:', metadataUpdateError)
        // Don't fail the request, document was already updated
      }
    }

    console.log('[OS Update API] Line item data saved successfully')

    return NextResponse.json(
      {
        success: true,
        document: updatedDocument,
        updatedItem: {
          id: itemId,
          type: itemType,
          updates,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[OS Update API] Error updating line item:', error)

    return NextResponse.json(
      {
        error: 'Failed to update line item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// PUT /api/documents/os-update - Bulk update all OS/T-12 data (for saving all changes at once)
export async function PUT(request: NextRequest) {
  try {
    console.log('[OS Update API] Bulk update request received')

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
      propertyId,
      incomeItems,
      expenseItems,
      capitalItems,
      debtItems,
    } = body

    console.log('[OS Update API] Bulk update for property:', propertyId)

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Missing required field: propertyId' },
        { status: 400 }
      )
    }

    // Fetch the existing OS document by propertyId and companyId
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('id, document_id, extraction_result')
      .eq('property_id', propertyId)
      .eq('company_id', companyId)
      .in('document_type', ['operating_statement', 't12'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !existingDoc) {
      console.error('[OS Update API] Bulk fetch error:', fetchError)
      return NextResponse.json(
        { error: 'OS Document not found for this property' },
        { status: 404 }
      )
    }
    
    console.log('[OS Update API] Found document with id:', existingDoc.id)

    const extractionResult = existingDoc.extraction_result as unknown as OSExtractionResult

    if (!extractionResult) {
      return NextResponse.json(
        { error: 'No extraction result found in document' },
        { status: 400 }
      )
    }

    // Update all provided item arrays
    if (incomeItems !== undefined) {
      extractionResult.income_items = incomeItems
    }
    if (expenseItems !== undefined) {
      extractionResult.expense_items = expenseItems
    }
    if (capitalItems !== undefined) {
      extractionResult.capital_items = capitalItems
    }
    if (debtItems !== undefined) {
      extractionResult.debt_items = debtItems
    }

    // Update the document in the database using the primary key id
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        extraction_result: extractionResult as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingDoc.id)
      .select()
      .single()

    if (updateError || !updatedDocument) {
      console.error('[OS Update API] Bulk update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    // Also update the property metadata if os_extraction exists there
    // This ensures consistency since os-data API may read from either source
    const { data: property } = await supabase
      .from('properties')
      .select('id, metadata')
      .eq('id', propertyId)
      .eq('company_id', companyId)
      .single()

    if (property?.metadata && (property.metadata as { os_extraction?: unknown }).os_extraction) {
      console.log('[OS Update API] Also updating property metadata (bulk)')
      const currentMetadata = property.metadata as Record<string, unknown>
      const { error: metadataUpdateError } = await supabase
        .from('properties')
        .update({
          metadata: {
            ...currentMetadata,
            os_extraction: extractionResult,
            os_extracted_at: new Date().toISOString(),
          },
        })
        .eq('id', propertyId)
        .eq('company_id', companyId)

      if (metadataUpdateError) {
        console.error('[OS Update API] Metadata update error (bulk):', metadataUpdateError)
        // Don't fail the request, document was already updated
      }
    }

    console.log('[OS Update API] Bulk update saved successfully')

    return NextResponse.json(
      {
        success: true,
        document: updatedDocument,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[OS Update API] Error in bulk update:', error)

    return NextResponse.json(
      {
        error: 'Failed to update document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
