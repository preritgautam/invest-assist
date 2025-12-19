import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { OMExtractionResult, OMPropertyInfo, OMFinancialInfo, OMInvestmentInfo, OMReturnsInfo, OMProFormaProjection, OMSourcesUses, OMSourceUseItem, OMImageInfo, Json } from '@/lib/supabase/database.types'

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

// OM Extraction Prompt for property data
const OM_EXTRACTION_PROMPT = `You are an expert commercial real estate analyst. Analyze this Offering Memorandum (OM) document and extract all property information.

## Extract the following data categories:

### 1. Property Information
- property_name: Name of the property/asset
- property_address: Full street address
- city: City name
- state: State (2-letter code preferred)
- zip_code: ZIP code
- property_type: Type (e.g., "Multifamily", "Office", "Retail", "Industrial")
- class_rating: Property class (A, B, C, or A+, B-, etc.)
- year_built: Year the property was built (number)
- year_renovated: Year of last major renovation (number, null if none)
- total_units: Total number of units (number)
- avg_unit_size: Average square footage per unit (number)
- unit_mix_breakdown: Array of unit types with their count, avg_sqft, and avg_rent
- building_count: Number of buildings (number)
- stories: Number of stories (number)
- amenity_list: Array of amenities (pool, gym, clubhouse, etc.)
- parking_ratio: Parking spaces per unit (number)
- acreage: Total land area in acres (number)
- owner: Current owner/seller name
- manager: Property management company

### 2. Financial Information
- offer_price: Asking/offer price in dollars (number, no commas)
- price_per_unit: Price per unit (number)
- price_per_sf: Price per square foot (number)
- cap_rate: Capitalization rate as decimal (e.g., 0.055 for 5.5%)
- noi: Net Operating Income (number)
- effective_gross_income: EGI (number)
- total_operating_expenses: Total expenses (number)
- rent_growth_rate: Annual rent growth rate as decimal (e.g., 0.03 for 3%)
- market_rent_psf: Market rent per square foot (number)
- market_rent_unit: Market rent per unit (number)
- loan_amount: Assumed/proposed loan amount (number)
- interest_rate: Loan interest rate as decimal (e.g., 0.065 for 6.5%)
- amortization: Amortization period in years (number)
- loan_term: Loan term in years (number)
- ltv: Loan-to-value ratio as decimal (e.g., 0.65 for 65%)

### 3. Investment Information
- investment_highlights: Array of key investment highlights/bullet points
- property_description: Detailed property description paragraph
- investment_thesis: Why this is a good investment
- submarket_description: Description of the submarket/area
- renovation_plan: Any planned renovations or value-add opportunities
- median_household_income: Median household income in the area (number)
- population_growth_rate: Population growth rate as decimal
- population_radius_1mi: Population within 1 mile (number)
- population_radius_3mi: Population within 3 miles (number)

### 4. Images Found in Document
For EACH image you can identify in the document (photos, not charts/graphs), provide:
- page_number: Page where the image appears (1-indexed)
- image_index: Index of image on that page (0-indexed, if multiple images per page)
- description: Brief description of what the image shows
- estimated_category: One of: "exterior", "interior", "amenity", "aerial", "map", "floorplan", "other"
- estimated_subcategory: More specific category (e.g., "pool", "clubhouse", "living_room", "kitchen", "bedroom", "bathroom", "parking", "landscaping", "signage")

## Response Format (JSON):
{
  "property_info": {
    "property_name": string | null,
    "property_address": string | null,
    "city": string | null,
    "state": string | null,
    "zip_code": string | null,
    "property_type": string | null,
    "class_rating": string | null,
    "year_built": number | null,
    "year_renovated": number | null,
    "total_units": number | null,
    "avg_unit_size": number | null,
    "unit_mix_breakdown": [{"unit_type": string, "count": number, "avg_sqft": number, "avg_rent": number}] | null,
    "building_count": number | null,
    "stories": number | null,
    "amenity_list": string[] | null,
    "parking_ratio": number | null,
    "acreage": number | null,
    "owner": string | null,
    "manager": string | null
  },
  "financial_info": {
    "offer_price": number | null,
    "price_per_unit": number | null,
    "price_per_sf": number | null,
    "cap_rate": number | null,
    "noi": number | null,
    "effective_gross_income": number | null,
    "total_operating_expenses": number | null,
    "rent_growth_rate": number | null,
    "market_rent_psf": number | null,
    "market_rent_unit": number | null,
    "loan_amount": number | null,
    "interest_rate": number | null,
    "amortization": number | null,
    "loan_term": number | null,
    "ltv": number | null
  },
  "investment_info": {
    "investment_highlights": string[] | null,
    "property_description": string | null,
    "investment_thesis": string | null,
    "submarket_description": string | null,
    "renovation_plan": string | null,
    "median_household_income": number | null,
    "population_growth_rate": number | null,
    "population_radius_1mi": number | null,
    "population_radius_3mi": number | null
  },
  "images": [
    {
      "page_number": number,
      "image_index": number,
      "description": string | null,
      "estimated_category": "exterior" | "interior" | "amenity" | "aerial" | "map" | "floorplan" | "other",
      "estimated_subcategory": string | null
    }
  ]
}

## Important Rules:
- Return ONLY valid JSON, no markdown code blocks
- Use null for any fields you cannot find in the document
- Convert all percentages to decimals (5.5% -> 0.055)
- Remove currency symbols and commas from numbers
- Be conservative - only include data you're confident about
- List ALL property images you find, even if you're unsure of their category
- Do not include charts, graphs, or tables in the images array - only property photos`

// POST /api/documents/om-extract - Extract property data from an Offering Memorandum
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
    const { documentId, propertyId } = body

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

    // Verify document is an OM or can be processed as OM
    if (document.document_type && document.document_type !== 'offering_memorandum') {
      return NextResponse.json(
        { error: 'Document is not an Offering Memorandum' },
        { status: 400 }
      )
    }

    console.log('[OM Extract API] Processing document:', documentId)

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
    }

    console.log('[OM Extract API] Calling Gemini for extraction...')

    // Call Gemini Vision API for OM extraction
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: OM_EXTRACTION_PROMPT },
    ])

    const response = result.response
    const text = response.text()

    // Parse JSON from response
    let extractionResult: OMExtractionResult

    try {
      // Extract JSON from response (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      const parsed = JSON.parse(jsonMatch[0])

      // Normalize and validate the response
      extractionResult = {
        property_info: normalizePropertyInfo(parsed.property_info || {}),
        financial_info: normalizeFinancialInfo(parsed.financial_info || {}),
        investment_info: normalizeInvestmentInfo(parsed.investment_info || {}),
        returns_info: normalizeReturnsInfo(parsed.returns_info || {}),
        pro_forma_projections: normalizeProFormaProjections(parsed.pro_forma_projections || []),
        sources_uses: normalizeSourcesUses(parsed.sources_uses),
        images: normalizeImages(parsed.images || []),
      }

      console.log('[OM Extract API] Extracted data:', {
        property_name: extractionResult.property_info.property_name,
        total_units: extractionResult.property_info.total_units,
        offer_price: extractionResult.financial_info.offer_price,
        images_found: extractionResult.images.length,
      })
    } catch (parseError) {
      console.error('[OM Extract API] Failed to parse Gemini response:', text)
      await supabase
        .from('documents')
        .update({
          extraction_status: 'failed',
          error_message: 'Failed to parse extraction response',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json(
        { error: 'Failed to parse extraction response' },
        { status: 500 }
      )
    }

    // Update document with extraction result
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        extraction_status: 'completed',
        extraction_result: extractionResult as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('[OM Extract API] Failed to update document:', updateError)
    }

    // If propertyId is provided, update the property with extracted data
    if (propertyId) {
      await updatePropertyFromOMExtraction(supabase, propertyId, companyId, extractionResult)
    }

    console.log('[OM Extract API] Extraction completed for document:', documentId)

    return NextResponse.json({
      success: true,
      extraction: extractionResult,
      documentId,
      propertyId,
    }, { status: 200 })

  } catch (error) {
    console.error('[OM Extract API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Normalize property info
function normalizePropertyInfo(data: any): OMPropertyInfo {
  // Normalize unit mix with new fields
  const normalizedUnitMix = Array.isArray(data.unit_mix_breakdown)
    ? data.unit_mix_breakdown.map((unit: any) => ({
        unit_type: unit.unit_type || 'Unknown',
        count: typeof unit.count === 'number' ? unit.count : 0,
        avg_sqft: typeof unit.avg_sqft === 'number' ? unit.avg_sqft : null,
        avg_rent: typeof unit.avg_rent === 'number' ? unit.avg_rent : null,
        post_reno_rent: typeof unit.post_reno_rent === 'number' ? unit.post_reno_rent : null,
        percentage: typeof unit.percentage === 'number' ? unit.percentage : null,
      }))
    : null

  // Normalize coordinates
  const normalizedCoordinates = data.coordinates &&
    typeof data.coordinates.lat === 'number' &&
    typeof data.coordinates.lng === 'number'
      ? { lat: data.coordinates.lat, lng: data.coordinates.lng }
      : null

  return {
    property_name: data.property_name || null,
    property_address: data.property_address || null,
    city: data.city || null,
    state: data.state || null,
    zip_code: data.zip_code || null,
    property_type: data.property_type || null,
    class_rating: data.class_rating || null,
    year_built: typeof data.year_built === 'number' ? data.year_built : null,
    year_renovated: typeof data.year_renovated === 'number' ? data.year_renovated : null,
    total_units: typeof data.total_units === 'number' ? data.total_units : null,
    avg_unit_size: typeof data.avg_unit_size === 'number' ? data.avg_unit_size : null,
    unit_mix_breakdown: normalizedUnitMix,
    building_count: typeof data.building_count === 'number' ? data.building_count : null,
    stories: typeof data.stories === 'number' ? data.stories : null,
    amenity_list: Array.isArray(data.amenity_list) ? data.amenity_list : null,
    parking_ratio: typeof data.parking_ratio === 'number' ? data.parking_ratio : null,
    acreage: typeof data.acreage === 'number' ? data.acreage : null,
    owner: data.owner || null,
    manager: data.manager || null,
    occupancy_rate: typeof data.occupancy_rate === 'number' ? data.occupancy_rate : null,
    coordinates: normalizedCoordinates,
  }
}

// Normalize financial info
function normalizeFinancialInfo(data: any): OMFinancialInfo {
  return {
    offer_price: typeof data.offer_price === 'number' ? data.offer_price : null,
    price_per_unit: typeof data.price_per_unit === 'number' ? data.price_per_unit : null,
    price_per_sf: typeof data.price_per_sf === 'number' ? data.price_per_sf : null,
    cap_rate: typeof data.cap_rate === 'number' ? data.cap_rate : null,
    noi: typeof data.noi === 'number' ? data.noi : null,
    effective_gross_income: typeof data.effective_gross_income === 'number' ? data.effective_gross_income : null,
    total_operating_expenses: typeof data.total_operating_expenses === 'number' ? data.total_operating_expenses : null,
    rent_growth_rate: typeof data.rent_growth_rate === 'number' ? data.rent_growth_rate : null,
    market_rent_psf: typeof data.market_rent_psf === 'number' ? data.market_rent_psf : null,
    market_rent_unit: typeof data.market_rent_unit === 'number' ? data.market_rent_unit : null,
    loan_amount: typeof data.loan_amount === 'number' ? data.loan_amount : null,
    interest_rate: typeof data.interest_rate === 'number' ? data.interest_rate : null,
    amortization: typeof data.amortization === 'number' ? data.amortization : null,
    loan_term: typeof data.loan_term === 'number' ? data.loan_term : null,
    ltv: typeof data.ltv === 'number' ? data.ltv : null,
    dscr: typeof data.dscr === 'number' ? data.dscr : null,
    expense_ratio: typeof data.expense_ratio === 'number' ? data.expense_ratio : null,
  }
}

// Normalize investment info
function normalizeInvestmentInfo(data: any): OMInvestmentInfo {
  return {
    investment_highlights: Array.isArray(data.investment_highlights) ? data.investment_highlights : null,
    property_description: data.property_description || null,
    investment_thesis: data.investment_thesis || null,
    submarket_description: data.submarket_description || null,
    renovation_plan: data.renovation_plan || null,
    business_plan: Array.isArray(data.business_plan) ? data.business_plan : null,
    median_household_income: typeof data.median_household_income === 'number' ? data.median_household_income : null,
    population_growth_rate: typeof data.population_growth_rate === 'number' ? data.population_growth_rate : null,
    population_radius_1mi: typeof data.population_radius_1mi === 'number' ? data.population_radius_1mi : null,
    population_radius_3mi: typeof data.population_radius_3mi === 'number' ? data.population_radius_3mi : null,
    employment_growth_rate: typeof data.employment_growth_rate === 'number' ? data.employment_growth_rate : null,
    major_employers: Array.isArray(data.major_employers) ? data.major_employers : null,
  }
}

// Normalize returns info
function normalizeReturnsInfo(data: any): OMReturnsInfo {
  return {
    irr: typeof data.irr === 'number' ? data.irr : null,
    cash_on_cash: typeof data.cash_on_cash === 'number' ? data.cash_on_cash : null,
    equity_multiple: typeof data.equity_multiple === 'number' ? data.equity_multiple : null,
    hold_period: data.hold_period || null,
    average_annual_return: typeof data.average_annual_return === 'number' ? data.average_annual_return : null,
  }
}

// Normalize pro forma projections
function normalizeProFormaProjections(data: any[]): OMProFormaProjection[] | null {
  if (!Array.isArray(data) || data.length === 0) return null

  return data.map((proj: any, index: number) => ({
    year: typeof proj.year === 'number' ? proj.year : index + 1,
    year_label: proj.year_label || `Year ${index + 1}`,
    noi: typeof proj.noi === 'number' ? proj.noi : null,
    cash_flow: typeof proj.cash_flow === 'number' ? proj.cash_flow : null,
    property_value: typeof proj.property_value === 'number' ? proj.property_value : null,
  }))
}

// Normalize sources & uses
function normalizeSourcesUses(data: any): OMSourcesUses | null {
  if (!data || typeof data !== 'object') return null

  const normalizeItems = (items: any[]): OMSourceUseItem[] => {
    if (!Array.isArray(items)) return []
    return items.map((item: any) => ({
      item: item.item || 'Unknown',
      amount: typeof item.amount === 'number' ? item.amount : 0,
      percentage: typeof item.percentage === 'number' ? item.percentage : null,
    }))
  }

  return {
    sources: normalizeItems(data.sources),
    uses: normalizeItems(data.uses),
    total_sources: typeof data.total_sources === 'number' ? data.total_sources : null,
    total_uses: typeof data.total_uses === 'number' ? data.total_uses : null,
  }
}

// Normalize images
function normalizeImages(data: any[]): OMImageInfo[] {
  if (!Array.isArray(data)) return []

  return data.map((img, index) => ({
    page_number: typeof img.page_number === 'number' ? img.page_number : index + 1,
    image_index: typeof img.image_index === 'number' ? img.image_index : 0,
    description: img.description || null,
    estimated_category: validateImageCategory(img.estimated_category),
    estimated_subcategory: img.estimated_subcategory || null,
  }))
}

// Validate image category
function validateImageCategory(category: any): OMImageInfo['estimated_category'] {
  const validCategories = ['exterior', 'interior', 'amenity', 'aerial', 'map', 'floorplan', 'other']
  if (typeof category === 'string' && validCategories.includes(category.toLowerCase())) {
    return category.toLowerCase() as OMImageInfo['estimated_category']
  }
  return 'other'
}

// Update property with OM extraction data
async function updatePropertyFromOMExtraction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  companyId: string,
  extraction: OMExtractionResult
) {
  const { property_info, financial_info, investment_info } = extraction

  // Build update object with only non-null values
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  // Property info
  if (property_info.property_name) updateData.name = property_info.property_name
  if (property_info.property_address) updateData.address = property_info.property_address
  if (property_info.city) updateData.city = property_info.city
  if (property_info.state) updateData.state = property_info.state
  if (property_info.zip_code) updateData.zip_code = property_info.zip_code
  if (property_info.total_units) updateData.units = property_info.total_units
  if (property_info.year_built) updateData.year_built = property_info.year_built
  if (property_info.avg_unit_size) updateData.avg_sqft_per_unit = property_info.avg_unit_size

  // Financial info
  if (financial_info.offer_price) updateData.offer_price = financial_info.offer_price
  if (financial_info.cap_rate) updateData.cap_rate = financial_info.cap_rate * 100 // Convert decimal to percentage

  // Store full extraction in metadata
  updateData.metadata = {
    om_extraction: extraction,
    om_extracted_at: new Date().toISOString(),
  }

  // Update status to active since we have data now
  updateData.status = 'active'

  const { error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', propertyId)
    .eq('company_id', companyId)

  if (error) {
    console.error('[OM Extract API] Failed to update property:', error)
  } else {
    console.log('[OM Extract API] Updated property:', propertyId)
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
