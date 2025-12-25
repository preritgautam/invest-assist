import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Json } from '@/lib/supabase/database.types'
import { jsonrepair } from 'jsonrepair'

const BUCKET_NAME = 'documents'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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

// Monthly data interface
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

// Line item interface (matches T12ActualsTab structure)
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

// OS Extraction result interface
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

// OS Extraction Prompt for T-12/Operating Statement data
export const OS_EXTRACTION_PROMPT = `You are an expert commercial real estate analyst specializing in operating statement (T-12) analysis. Analyze this Operating Statement / T-12 / Income & Expense Statement document and extract all financial line items with monthly breakdowns.

## CRITICAL INSTRUCTIONS:
1. Extract EVERY line item from the document with its monthly values (Jan-Dec)
2. Maintain the hierarchical structure of the document (Income > Rental Income > line items)
3. Calculate annual amounts as the sum of monthly values
4. Calculate per-unit amounts by dividing annual by total units (if units are known)
5. Use NEGATIVE values for items that reduce income (vacancy loss, concessions, bad debt)
6. Use POSITIVE values for expenses (they are costs, reported as positive numbers)

## LINE ITEM CATEGORIES TO EXTRACT:

### INCOME SECTION
Extract these income line items with monthly data:

**Rental Income (under Income > Rental Income):**
- RENTAL_INCOME: Gross potential rent / scheduled rent
- VACANCY_LOSS: Physical vacancy and economic loss (NEGATIVE value)
- CONCESSIONS: Move-in specials, free rent, discounts (NEGATIVE value)
- BAD_DEBT: Uncollected rent, write-offs (NEGATIVE value)
- NET_RENTAL_INCOME: Calculated total (= RENTAL_INCOME + VACANCY_LOSS + CONCESSIONS + BAD_DEBT)

**Other Income (under Income > Other Income):**
- PARKING: Parking income, garage fees
- RUBS: Utility billback / RUBS income
- APPLICATION_FEES: Application fees
- LATE_FEES: Late payment fees
- OTHER_FEES: Pet fees, storage, amenity fees, laundry, etc.
- TOTAL_OTHER_INCOME: Sum of other income categories

**Recoveries (under Income > Recoveries):**
- MISC_INCOME: Any other miscellaneous income
- TOTAL_RECOVERIES: Sum of recovery categories

**Major Total:**
- EFFECTIVE_GROSS_INCOME: Net Rental Income + Total Other Income + Total Recoveries

### EXPENSE SECTION
Extract these expense line items with monthly data:

**Controllable Expenses (under Operating Expenses > Controllable Expenses):**
- PAYROLL: On-site staff salaries, wages
- BENEFITS: Employee benefits, health insurance
- MANAGEMENT_FEE: Property management fee (often % of EGI)
- ADMINISTRATIVE: Office supplies, postage, legal, accounting
- MARKETING: Advertising, marketing, promotion
- PROFESSIONAL_FEES: Legal, accounting, consulting fees
- REPAIRS: General repairs, unit repairs
- MAINTENANCE: Routine maintenance, HVAC, plumbing
- TURNOVER: Make-ready, unit turnover costs
- CONTRACT_SERVICES: Janitorial, pest control, etc.
- LANDSCAPING: Grounds maintenance, landscaping
- SUPPLIES: Cleaning supplies, maintenance supplies
- SECURITY: Security services, patrol, cameras
- TOTAL_CONTROLLABLE_EXPENSES: Sum of controllable categories

**Non-Controllable Expenses (under Operating Expenses > Non-Controllable Expenses):**
- UTILITIES: Electric, gas, water, sewer, trash (owner-paid)
- INSURANCE: Property insurance, liability insurance
- REAL_ESTATE_TAX: Property taxes, real estate taxes
- OTHER_TAX: Other taxes (franchise, business, etc.)
- TOTAL_NON_CONTROLLABLE_EXPENSES: Sum of non-controllable categories

**Major Total:**
- TOTAL_OPERATING_EXPENSES: Total Controllable + Total Non-Controllable

### CAPITAL SECTION
Extract these capital line items with monthly data:

**Capital Items:**
- REPLACEMENT_RESERVES: Capital reserves, replacement reserves
- CAPITAL_IMPROVEMENTS: CapEx, capital improvements, renovations
- LEASING_COMMISSIONS: Leasing costs, commissions
- TOTAL_CAPITAL_EXPENSES: Sum of capital categories

### DEBT SERVICE SECTION (if present)
Extract these debt line items with monthly data:

**Debt Service:**
- INTEREST_PAYMENT: Mortgage interest, loan interest
- DEBT_SERVICE: Principal and interest payment (P&I)
- TOTAL_DEBT_SERVICE: Sum of debt service items

## RESPONSE FORMAT (JSON):
{
  "property_info": {
    "property_name": string | null,
    "total_units": number | null,
    "period_start": "YYYY-MM-DD" | null,
    "period_end": "YYYY-MM-DD" | null,
    "fiscal_year": number | null
  },
  "income_items": [
    {
      "id": "income",
      "name": "Income",
      "annualAmount": 0,
      "perUnit": 0,
      "notes": "",
      "isExpanded": true,
      "isCalculated": false,
      "hasChildren": true,
      "children": [
        {
          "id": "rental-income",
          "name": "Rental Income",
          "annualAmount": 0,
          "perUnit": 0,
          "notes": "",
          "isExpanded": true,
          "isCalculated": false,
          "hasChildren": true,
          "children": [
            {
              "id": "rental-income-line",
              "name": "RENTAL_INCOME",
              "annualAmount": number,
              "perUnit": number,
              "notes": "",
              "hasFormula": true,
              "formula": "Extracted from document",
              "docTotal": number,
              "monthlyData": {
                "jan": number, "feb": number, "mar": number, "apr": number,
                "may": number, "jun": number, "jul": number, "aug": number,
                "sep": number, "oct": number, "nov": number, "dec": number
              },
              "label": "Rental Income"
            }
            // ... more rental income children
          ]
        },
        {
          "id": "net-rental-income",
          "name": "NET_RENTAL_INCOME",
          "annualAmount": number,
          "perUnit": number,
          "notes": "",
          "isCalculated": true,
          "hasFormula": true,
          "formula": "= RENTAL_INCOME + VACANCY_LOSS + CONCESSIONS + BAD_DEBT",
          "label": "Net Rental Income"
        },
        // ... other income, recoveries
        {
          "id": "total-other-income",
          "name": "TOTAL_OTHER_INCOME",
          ...
        }
      ]
    },
    {
      "id": "effective-gross-income",
      "name": "EFFECTIVE_GROSS_INCOME",
      "annualAmount": number,
      "perUnit": number,
      "notes": "",
      "isCalculated": true,
      "isMajorTotal": true,
      "hasFormula": true,
      "formula": "= NET_RENTAL_INCOME + TOTAL_OTHER_INCOME + TOTAL_RECOVERIES",
      "label": "Effective Gross Income"
    }
  ],
  "expense_items": [
    {
      "id": "operating-expenses",
      "name": "Operating Expenses",
      ...
      "children": [
        {
          "id": "controllable-expenses",
          "name": "Controllable Expenses",
          ...
          "children": [
            {
              "id": "payroll",
              "name": "PAYROLL",
              "annualAmount": number,
              "perUnit": number,
              "docTotal": number,
              "monthlyData": { ... },
              "label": "Payroll"
            }
            // ... more controllable expense children
          ]
        },
        {
          "id": "non-controllable-expenses",
          "name": "Non-Controllable Expenses",
          ...
        }
      ]
    },
    {
      "id": "total-operating-expenses",
      "name": "TOTAL_OPERATING_EXPENSES",
      "annualAmount": number,
      "perUnit": number,
      "isCalculated": true,
      "isMajorTotal": true,
      ...
    }
  ],
  "capital_items": [
    {
      "id": "capital-items",
      "name": "Capital Items",
      ...
      "children": [
        {
          "id": "replacement-reserves",
          "name": "REPLACEMENT_RESERVES",
          "annualAmount": number,
          "perUnit": number,
          "docTotal": number,
          "monthlyData": { ... },
          "label": "Replacement Reserves"
        }
        // ... more capital children
      ]
    },
    {
      "id": "total-capital-expenses",
      "name": "TOTAL_CAPITAL_EXPENSES",
      ...
    }
  ],
  "debt_items": [
    {
      "id": "debt-service",
      "name": "Debt Service",
      ...
      "children": [
        {
          "id": "interest-payment",
          "name": "INTEREST_PAYMENT",
          "annualAmount": number,
          "perUnit": number,
          "docTotal": number,
          "monthlyData": { ... },
          "label": "Interest Payment"
        }
        // ... more debt children
      ]
    },
    {
      "id": "total-debt-service",
      "name": "TOTAL_DEBT_SERVICE",
      ...
    }
  ],
  "summary": {
    "effective_gross_income": number | null,
    "total_operating_expenses": number | null,
    "net_operating_income": number | null,
    "total_capital_expenses": number | null,
    "total_debt_service": number | null,
    "cash_flow_after_debt": number | null
  }
}

## IMPORTANT RULES:
- Return ONLY valid JSON, no markdown code blocks
- Use null for any fields you cannot find in the document
- Monthly values should be actual extracted numbers, use 0 if not found
- annualAmount should equal the sum of all monthly values
- perUnit = annualAmount / total_units (use 0 if units unknown)
- docTotal should match the annual total shown in the document
- VACANCY_LOSS, CONCESSIONS, BAD_DEBT should be NEGATIVE numbers
- All expense items should be POSITIVE numbers
- If document shows quarterly data, divide by 3 for monthly estimates
- If document shows annual only, divide by 12 for monthly estimates
- Match line item names to the closest category from the list above
- Include custom/additional line items under the appropriate parent category
- Preserve the exact hierarchical structure shown in the format above`

// POST /api/documents/os-extract - Extract data from an Operating Statement / T-12
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
    const { documentId, propertyId, totalUnits } = body

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Get document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verify document belongs to user's company
    if (document.company_id !== companyId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Verify document is an Operating Statement or can be processed as one
    if (document.document_type && 
        document.document_type !== 'operating_statement' && 
        document.document_type !== 't12') {
      return NextResponse.json(
        { error: 'Document is not an Operating Statement / T-12' },
        { status: 400 }
      )
    }

    console.log('[OS Extract API] Processing document:', documentId)

    // Update extraction status to processing
    await supabase
      .from('documents')
      .update({
        extraction_status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    // Download file from storage
    if (!document.storage_path) {
      return NextResponse.json(
        { error: 'Document has no storage path' },
        { status: 400 }
      )
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(document.storage_path)

    if (downloadError || !fileData) {
      await supabase
        .from('documents')
        .update({
          extraction_status: 'failed',
          error_message: `Failed to download file: ${downloadError?.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json(
        { error: `Failed to download file: ${downloadError?.message}` },
        { status: 500 }
      )
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    // Determine MIME type
    const filename = document.filename.toLowerCase()
    let mimeType = 'application/pdf'

    if (filename.endsWith('.png')) {
      mimeType = 'image/png'
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      mimeType = 'image/jpeg'
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    } else if (filename.endsWith('.csv')) {
      mimeType = 'text/csv'
    }

    console.log('[OS Extract API] Calling Gemini for extraction...')

    // Add total units context to prompt if provided
    let enhancedPrompt = OS_EXTRACTION_PROMPT
    if (totalUnits && typeof totalUnits === 'number') {
      enhancedPrompt += `\n\n## ADDITIONAL CONTEXT:\nThis property has ${totalUnits} total units. Use this to calculate all perUnit values.`
    }

    // Call Gemini Vision API for OS extraction with JSON response mode
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: enhancedPrompt },
    ])

    const response = result.response
    const text = response.text()

    console.log('[OS Extract API] Raw Gemini response length:', text.length)

    // Parse JSON from response
    let extractionResult: OSExtractionResult

    try {
      // With responseMimeType: 'application/json', Gemini should return pure JSON
      // But we still handle fallbacks for safety
      let jsonString: string = text.trim()
      
      // If response is wrapped in code blocks, extract it
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim()
        console.log('[OS Extract API] Found JSON in code block')
      } else if (!jsonString.startsWith('{')) {
        // Fall back to finding the outermost JSON object
        const firstBrace = text.indexOf('{')
        const lastBrace = text.lastIndexOf('}')
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = text.substring(firstBrace, lastBrace + 1)
          console.log('[OS Extract API] Extracted JSON from braces')
        }
      }
      
      if (!jsonString || !jsonString.startsWith('{')) {
        console.error('[OS Extract API] No JSON found in response. Response preview:', text.substring(0, 500))
        throw new Error('No JSON found in response')
      }

      // Use jsonrepair library to fix malformed JSON from Gemini
      console.log('[OS Extract API] Applying jsonrepair to response...')
      let repairedJson: string
      try {
        repairedJson = jsonrepair(jsonString)
        console.log('[OS Extract API] JSON repaired successfully')
      } catch (repairError) {
        console.error('[OS Extract API] jsonrepair failed:', repairError)
        // Fall back to original string
        repairedJson = jsonString
      }

      // Parse the repaired JSON
      const parsed = JSON.parse(repairedJson)
      console.log('[OS Extract API] JSON parsed successfully')

      // Normalize and validate the response
      extractionResult = {
        property_info: normalizePropertyInfo(parsed.property_info || {}),
        income_items: normalizeLineItems(parsed.income_items || [], 'income'),
        expense_items: normalizeLineItems(parsed.expense_items || [], 'expense'),
        capital_items: normalizeLineItems(parsed.capital_items || [], 'capital'),
        debt_items: normalizeLineItems(parsed.debt_items || [], 'debt'),
        summary: normalizeSummary(parsed.summary || {}),
      }

      console.log('[OS Extract API] Extracted data:', {
        property_name: extractionResult.property_info.property_name,
        total_units: extractionResult.property_info.total_units,
        egi: extractionResult.summary.effective_gross_income,
        opex: extractionResult.summary.total_operating_expenses,
        noi: extractionResult.summary.net_operating_income,
      })
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error'
      console.error('[OS Extract API] Failed to parse Gemini response:', errorMessage)
      console.error('[OS Extract API] Response preview:', text.substring(0, 1000))
      await supabase
        .from('documents')
        .update({
          extraction_status: 'failed',
          error_message: `Failed to parse extraction response: ${errorMessage}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json(
        { error: 'Failed to parse extraction response', details: errorMessage },
        { status: 500 }
      )
    }

    // Update document with extraction result
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        document_type: 'operating_statement',
        classification_status: 'completed',
        extraction_status: 'completed',
        extraction_result: extractionResult as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('[OS Extract API] Failed to update document:', updateError)
    }

    // If propertyId is provided, update the property with extracted data
    if (propertyId) {
      await updatePropertyFromOSExtraction(supabase, propertyId, companyId, extractionResult)
    }

    console.log('[OS Extract API] Extraction completed for document:', documentId)

    return NextResponse.json({
      success: true,
      extraction: extractionResult,
      documentId,
      propertyId,
    }, { status: 200 })

  } catch (error) {
    console.error('[OS Extract API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Normalize property info
function normalizePropertyInfo(data: any): OSExtractionResult['property_info'] {
  return {
    property_name: data.property_name || null,
    total_units: typeof data.total_units === 'number' ? data.total_units : null,
    period_start: data.period_start || null,
    period_end: data.period_end || null,
    fiscal_year: typeof data.fiscal_year === 'number' ? data.fiscal_year : null,
  }
}

// Normalize line items recursively
function normalizeLineItems(items: any[], type: string): LineItem[] {
  if (!Array.isArray(items)) return []

  return items.map((item) => normalizeLineItem(item, type))
}

function normalizeLineItem(item: any, type: string): LineItem {
  const normalized: LineItem = {
    id: item.id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: item.name || 'Unknown',
    annualAmount: typeof item.annualAmount === 'number' ? item.annualAmount : 0,
    perUnit: typeof item.perUnit === 'number' ? item.perUnit : 0,
    notes: item.notes || '',
  }

  // Optional properties
  if (item.isExpanded !== undefined) normalized.isExpanded = Boolean(item.isExpanded)
  if (item.isCalculated !== undefined) normalized.isCalculated = Boolean(item.isCalculated)
  if (item.hasChildren !== undefined) normalized.hasChildren = Boolean(item.hasChildren)
  if (item.hasFormula !== undefined) normalized.hasFormula = Boolean(item.hasFormula)
  if (item.formula) normalized.formula = item.formula
  if (typeof item.docTotal === 'number') normalized.docTotal = item.docTotal
  if (item.label) normalized.label = item.label
  if (item.isMajorTotal !== undefined) normalized.isMajorTotal = Boolean(item.isMajorTotal)

  // Monthly data
  if (item.monthlyData && typeof item.monthlyData === 'object') {
    normalized.monthlyData = normalizeMonthlyData(item.monthlyData)
  }

  // Children (recursive)
  if (Array.isArray(item.children) && item.children.length > 0) {
    normalized.children = item.children.map((child: any) => normalizeLineItem(child, type))
    normalized.hasChildren = true
  }

  return normalized
}

// Normalize monthly data
function normalizeMonthlyData(data: any): MonthlyData {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const
  const result: MonthlyData = {
    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
  }

  for (const month of months) {
    if (typeof data[month] === 'number') {
      result[month] = data[month]
    }
  }

  return result
}

// Normalize summary
function normalizeSummary(data: any): OSExtractionResult['summary'] {
  return {
    effective_gross_income: typeof data.effective_gross_income === 'number' ? data.effective_gross_income : null,
    total_operating_expenses: typeof data.total_operating_expenses === 'number' ? data.total_operating_expenses : null,
    net_operating_income: typeof data.net_operating_income === 'number' ? data.net_operating_income : null,
    total_capital_expenses: typeof data.total_capital_expenses === 'number' ? data.total_capital_expenses : null,
    total_debt_service: typeof data.total_debt_service === 'number' ? data.total_debt_service : null,
    cash_flow_after_debt: typeof data.cash_flow_after_debt === 'number' ? data.cash_flow_after_debt : null,
  }
}

// Update property with OS extraction data
async function updatePropertyFromOSExtraction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  companyId: string,
  extraction: OSExtractionResult
) {
  const { property_info, summary } = extraction

  // Build update object with only non-null values
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  // Property info
  if (property_info.property_name) updateData.name = property_info.property_name
  if (property_info.total_units) updateData.units = property_info.total_units

  // Financial summary
  if (summary.effective_gross_income) updateData.effective_gross_income = summary.effective_gross_income
  if (summary.total_operating_expenses) updateData.operating_expenses = summary.total_operating_expenses
  if (summary.net_operating_income) updateData.noi = summary.net_operating_income

  // Store full extraction in metadata
  updateData.metadata = {
    os_extraction: extraction,
    os_extracted_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', propertyId)
    .eq('company_id', companyId)

  if (error) {
    console.error('[OS Extract API] Failed to update property:', error)
  } else {
    console.log('[OS Extract API] Updated property:', propertyId)
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
