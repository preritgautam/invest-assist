import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ClassificationResult, OMExtractionResult, OMPropertyInfo, OMFinancialInfo, OMInvestmentInfo, OMReturnsInfo, OMProFormaProjection, OMSourcesUses, OMSourceUseItem, OMImageInfo, Json } from '@/lib/supabase/database.types'
import { PDFDocument } from 'pdf-lib'

const BUCKET_NAME = 'documents'

// Helper to get actual PDF page count
async function getPdfPageCount(arrayBuffer: ArrayBuffer): Promise<number | null> {
  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
    return pdfDoc.getPageCount()
  } catch (error) {
    console.error('[Classification API] Failed to parse PDF for page count:', error)
    return null
  }
}

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

// OM Extraction Prompt - used when document is classified as offering_memorandum
const OM_EXTRACTION_PROMPT = `You are an expert commercial real estate analyst. This document has been identified as an Offering Memorandum. Extract ALL property information comprehensively.

## Extract the following data:

### Property Information
Extract: property_name, property_address, city, state, zip_code, property_type, class_rating, year_built, year_renovated, total_units, avg_unit_size, building_count, stories, amenity_list (array), parking_ratio, acreage, owner, manager, occupancy_rate (as decimal like 0.95 for 95%)

### Unit Mix (CRITICAL - extract fully)
Extract unit_mix_breakdown as array: [{unit_type, count, avg_sqft, avg_rent, post_reno_rent, percentage}]
- unit_type: "Studio", "1BR", "2BR", "3BR", etc.
- count: number of units of this type
- avg_sqft: average square footage
- avg_rent: current/market rent
- post_reno_rent: post-renovation rent if mentioned (null if not available)
- percentage: percentage of total units (calculate if not explicit)

### Financial Information
Extract: offer_price, price_per_unit, price_per_sf, cap_rate (as decimal), noi, effective_gross_income, total_operating_expenses, rent_growth_rate, market_rent_psf, market_rent_unit, loan_amount, interest_rate, amortization, loan_term, ltv, dscr (debt service coverage ratio), expense_ratio

### Returns Information (CRITICAL - look for investment returns section)
Extract: irr (internal rate of return as decimal), cash_on_cash (as decimal), equity_multiple (like 2.4 for 2.4X), hold_period (like "5 years"), average_annual_return

### Pro Forma Projections (if available)
Extract pro_forma_projections as array: [{year: 1, year_label: "Year 1", noi, cash_flow, property_value}]
Look for multi-year projections showing NOI growth, cash flow, and property values over the hold period.

### Sources & Uses of Capital (if available)
Extract sources_uses: {
  sources: [{item: "Equity", amount: number, percentage: number}, {item: "Debt", amount: number, percentage: number}],
  uses: [{item: "Purchase Price", amount: number, percentage: number}, {item: "Closing Costs", amount: number}, {item: "Renovation", amount: number}, ...],
  total_sources: number,
  total_uses: number
}

### Investment Information
Extract: investment_highlights (array of key selling points), property_description, investment_thesis, submarket_description, renovation_plan, business_plan (array of strategic steps), median_household_income, population_growth_rate, population_radius_1mi, population_radius_3mi, employment_growth_rate, major_employers (array)

### Images Found
For each property PHOTO (not charts/graphs), provide:
- page_number (1-indexed)
- image_index (0-indexed on page)
- description
- estimated_category: "exterior"|"interior"|"amenity"|"aerial"|"map"|"floorplan"|"other"
- estimated_subcategory: specific type like "pool", "clubhouse", "living_room", etc.

## Response Format:
{
  "om_extraction": {
    "property_info": {...},
    "financial_info": {...},
    "returns_info": {...},
    "investment_info": {...},
    "pro_forma_projections": [...],
    "sources_uses": {...},
    "images": [...]
  }
}

Use null for any values not found. Convert percentages to decimals (5.5% -> 0.055, 18.2% IRR -> 0.182).`

// Classification prompt for Gemini Vision - Enhanced for segment and period detection
const CLASSIFICATION_PROMPT = `You are a document classification expert for commercial real estate documents. Analyze this document thoroughly.

## Document Types to Identify:
1. **rent_roll** - List of tenants with unit numbers, lease terms, rent amounts, occupancy status
2. **operating_statement** - Financial statement showing income, expenses, NOI (also called T-12, trailing 12, income statement)
3. **offering_memorandum** - Marketing document for property sale (may contain embedded rent rolls and operating statements)
4. **appraisal** - Professional property valuation report
5. **insurance** - Insurance policy documents or certificates
6. **lease_abstract** - Summary of lease terms
7. **other** - Documents that don't fit above categories

## Critical Analysis Required:
1. **Identify ALL document segments** within this file - a single file may contain multiple document types on different pages
2. **Detect the exact page ranges** where each document type appears
3. **Extract date/period information** for each segment:
   - For Rent Rolls: Look for "As of [date]", "Rent Roll dated [date]", or similar
   - For Operating Statements/T-12: Look for period like "January 2024 - December 2024", "T-12 ending [date]", "Trailing 12 months as of [date]"
4. **Check for multiple instances** of the same document type (e.g., rent rolls for different dates, T-12s for different periods)

## Response Format (JSON):
{
  "document_type": "rent_roll" | "operating_statement" | "offering_memorandum" | "appraisal" | "insurance" | "lease_abstract" | "other",
  "confidence": 0.0-1.0,
  "total_pages": number,
  "segments": [
    {
      "type": "rent_roll" | "operating_statement" | "offering_memorandum" | "appraisal" | "insurance" | "lease_abstract" | "other",
      "page_range": "start-end" (e.g., "1-5", "10-15", or "all" for entire document),
      "confidence": 0.0-1.0,
      "period_info": {
        "document_date": "YYYY-MM-DD" or null (for rent rolls - the "as of" date),
        "period_start": "YYYY-MM-DD" or null (for T-12/OS - start of period),
        "period_end": "YYYY-MM-DD" or null (for T-12/OS - end of period),
        "period_label": "human readable label" (e.g., "As of Dec 15, 2024" or "T-12 Jan-Dec 2024")
      }
    }
  ]
}

## Important Rules:
- ALWAYS include at least one segment in the segments array
- If the document contains only one type, create a single segment with page_range "all"
- If you find multiple rent rolls or operating statements for different periods, create separate segments for each
- Be precise with page ranges - only include pages that actually contain that document type's data
- Extract dates even if approximate (e.g., if it says "December 2024", use "2024-12-01")
- For multi-page documents, carefully identify where each section starts and ends
- The primary document_type should match the dominant or first segment type`

// POST /api/documents/classify - Classify a document using Gemini Vision
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
    const { documentId } = body

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

    // Update classification status to processing
    await supabase
      .from('documents')
      .update({
        classification_status: 'processing',
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
          classification_status: 'failed',
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

    // Determine MIME type and get actual page count for PDFs
    const filename = document.filename.toLowerCase()
    let mimeType = 'application/pdf'
    let actualPageCount: number | null = null
    
    if (filename.endsWith('.xlsx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    } else if (filename.endsWith('.xls')) {
      mimeType = 'application/vnd.ms-excel'
    } else if (filename.endsWith('.png')) {
      mimeType = 'image/png'
      actualPageCount = 1 // Images are always 1 page
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      mimeType = 'image/jpeg'
      actualPageCount = 1 // Images are always 1 page
    } else if (filename.endsWith('.pdf')) {
      // Get actual PDF page count
      actualPageCount = await getPdfPageCount(arrayBuffer)
      console.log('[Classification API] Actual PDF page count:', actualPageCount)
    }

    // Call Gemini Vision API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: CLASSIFICATION_PROMPT },
    ])

    const response = result.response
    const text = response.text()

    // Parse JSON from response
    let classificationResult: ClassificationResult

    try {
      // Extract JSON from response (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      const parsed = JSON.parse(jsonMatch[0])

      // Ensure segments array exists - if not, create a default segment from legacy format or the document type
      if (!parsed.segments || !Array.isArray(parsed.segments) || parsed.segments.length === 0) {
        // Handle legacy embedded_documents format
        if (parsed.embedded_documents && Array.isArray(parsed.embedded_documents)) {
          parsed.segments = parsed.embedded_documents.map((ed: any) => ({
            type: ed.type,
            page_range: ed.page_range,
            confidence: parsed.confidence || 0.8,
            period_info: null,
          }))
        } else {
          // Create a single segment for the whole document
          parsed.segments = [{
            type: parsed.document_type,
            page_range: 'all',
            confidence: parsed.confidence || 0.8,
            period_info: null,
          }]
        }
      }

      // Validate and normalize each segment
      parsed.segments = parsed.segments.map((segment: any, index: number) => ({
        type: segment.type || parsed.document_type || 'other',
        page_range: segment.page_range || 'all',
        confidence: typeof segment.confidence === 'number' ? segment.confidence : 0.8,
        period_info: segment.period_info || null,
        sheet_index: segment.sheet_index,
        sheet_name: segment.sheet_name,
      }))

      classificationResult = parsed as ClassificationResult

      // Override Gemini's page count with actual page count if available
      if (actualPageCount !== null) {
        classificationResult.total_pages = actualPageCount
        
        // Also validate/fix segment page ranges to not exceed actual page count
        classificationResult.segments = classificationResult.segments.map(segment => {
          if (segment.page_range && segment.page_range !== 'all') {
            // Parse and validate page range
            const parts = segment.page_range.split('-').map(p => parseInt(p.trim(), 10))
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              const [start, end] = parts
              // Clamp to actual page count
              const validStart = Math.max(1, Math.min(start, actualPageCount))
              const validEnd = Math.max(1, Math.min(end, actualPageCount))
              if (validStart !== start || validEnd !== end) {
                console.log(`[Classification API] Correcting page range from ${segment.page_range} to ${validStart}-${validEnd}`)
                segment.page_range = `${validStart}-${validEnd}`
              }
            }
          }
          return segment
        })
      }

      console.log('[Classification API] Parsed result with segments:', {
        document_type: classificationResult.document_type,
        total_pages: classificationResult.total_pages,
        segment_count: classificationResult.segments.length,
        segments: classificationResult.segments.map(s => ({
          type: s.type,
          page_range: s.page_range,
          period_label: s.period_info?.period_label,
        })),
      })
    } catch (parseError) {
      console.error('[Classification API] Failed to parse Gemini response:', text)
      await supabase
        .from('documents')
        .update({
          classification_status: 'failed',
          error_message: 'Failed to parse classification response',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json(
        { error: 'Failed to parse classification response' },
        { status: 500 }
      )
    }

    // Update source document with classification result and total pages
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        document_type: classificationResult.document_type,
        classification_result: classificationResult as unknown as Json,
        classification_status: 'completed',
        total_pages: classificationResult.total_pages || null,
        is_source_file: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('[Classification API] Failed to update document:', updateError)
      return NextResponse.json(
        { error: `Failed to update document: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('[Classification API] Document classified:', documentId, classificationResult.document_type)

    // If document is an Offering Memorandum, perform additional extraction
    let omExtraction: OMExtractionResult | null = null

    if (classificationResult.document_type === 'offering_memorandum') {
      console.log('[Classification API] OM detected, performing additional extraction...')

      try {
        const omResult = await model.generateContent([
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: OM_EXTRACTION_PROMPT },
        ])

        const omResponse = omResult.response
        const omText = omResponse.text()

        // Parse OM extraction JSON
        const omJsonMatch = omText.match(/\{[\s\S]*\}/)
        if (omJsonMatch) {
          const omParsed = JSON.parse(omJsonMatch[0])
          const omData = omParsed.om_extraction || omParsed

          omExtraction = {
            property_info: normalizeOMPropertyInfo(omData.property_info || {}),
            financial_info: normalizeOMFinancialInfo(omData.financial_info || {}),
            investment_info: normalizeOMInvestmentInfo(omData.investment_info || {}),
            returns_info: normalizeOMReturnsInfo(omData.returns_info || {}),
            pro_forma_projections: normalizeOMProFormaProjections(omData.pro_forma_projections || []),
            sources_uses: normalizeOMSourcesUses(omData.sources_uses),
            images: normalizeOMImages(omData.images || []),
          }

          console.log('[Classification API] OM extraction completed:', {
            property_name: omExtraction.property_info.property_name,
            total_units: omExtraction.property_info.total_units,
            offer_price: omExtraction.financial_info.offer_price,
            images_found: omExtraction.images.length,
          })

          // Update document with OM extraction result
          await supabase
            .from('documents')
            .update({
              extraction_result: {
                classification: classificationResult,
                om_extraction: omExtraction,
              } as unknown as Json,
              extraction_status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', documentId)

          // If property_id is set, update the property with extracted data
          if (document.property_id) {
            await updatePropertyFromOMExtraction(supabase, document.property_id, companyId, omExtraction)

            // Trigger image extraction from the OM PDF
            console.log('[Classification API] Triggering image extraction for property:', document.property_id)
            try {
              // Call the om-images API internally to extract and store images
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              const imageExtractionResponse = await fetch(`${baseUrl}/api/documents/om-images`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  // Forward the auth cookie if available
                  'Cookie': request.headers.get('cookie') || '',
                },
                body: JSON.stringify({
                  documentId: documentId,
                  propertyId: document.property_id,
                  imageInfos: omExtraction.images,
                }),
              })

              if (imageExtractionResponse.ok) {
                const imageResult = await imageExtractionResponse.json()
                console.log('[Classification API] Image extraction completed:', {
                  totalExtracted: imageResult.totalExtracted,
                  totalInserted: imageResult.totalInserted,
                })
              } else {
                const errorText = await imageExtractionResponse.text()
                console.error('[Classification API] Image extraction failed:', errorText)
              }
            } catch (imgError) {
              console.error('[Classification API] Image extraction error:', imgError)
              // Don't fail the whole request, just log the error
            }
          }
        }
      } catch (omError) {
        console.error('[Classification API] OM extraction failed:', omError)
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      classification: classificationResult,
      om_extraction: omExtraction,
    }, { status: 200 })

  } catch (error) {
    console.error('[Classification API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Normalize OM property info
function normalizeOMPropertyInfo(data: any): OMPropertyInfo {
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

// Normalize OM financial info
function normalizeOMFinancialInfo(data: any): OMFinancialInfo {
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

// Normalize OM investment info
function normalizeOMInvestmentInfo(data: any): OMInvestmentInfo {
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

// Normalize OM returns info
function normalizeOMReturnsInfo(data: any): OMReturnsInfo {
  return {
    irr: typeof data.irr === 'number' ? data.irr : null,
    cash_on_cash: typeof data.cash_on_cash === 'number' ? data.cash_on_cash : null,
    equity_multiple: typeof data.equity_multiple === 'number' ? data.equity_multiple : null,
    hold_period: data.hold_period || null,
    average_annual_return: typeof data.average_annual_return === 'number' ? data.average_annual_return : null,
  }
}

// Normalize OM pro forma projections
function normalizeOMProFormaProjections(data: any[]): OMProFormaProjection[] | null {
  if (!Array.isArray(data) || data.length === 0) return null

  return data.map((proj: any, index: number) => ({
    year: typeof proj.year === 'number' ? proj.year : index + 1,
    year_label: proj.year_label || `Year ${index + 1}`,
    noi: typeof proj.noi === 'number' ? proj.noi : null,
    cash_flow: typeof proj.cash_flow === 'number' ? proj.cash_flow : null,
    property_value: typeof proj.property_value === 'number' ? proj.property_value : null,
  }))
}

// Normalize OM sources & uses
function normalizeOMSourcesUses(data: any): OMSourcesUses | null {
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

// Normalize OM images
function normalizeOMImages(data: any[]): OMImageInfo[] {
  if (!Array.isArray(data)) return []

  const validCategories = ['exterior', 'interior', 'amenity', 'aerial', 'map', 'floorplan', 'other']

  return data.map((img, index) => ({
    page_number: typeof img.page_number === 'number' ? img.page_number : index + 1,
    image_index: typeof img.image_index === 'number' ? img.image_index : 0,
    description: img.description || null,
    estimated_category: validCategories.includes(img.estimated_category?.toLowerCase())
      ? img.estimated_category.toLowerCase() as OMImageInfo['estimated_category']
      : 'other',
    estimated_subcategory: img.estimated_subcategory || null,
  }))
}

// Update property with OM extraction data
async function updatePropertyFromOMExtraction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  companyId: string,
  extraction: OMExtractionResult
) {
  const { property_info, financial_info, returns_info } = extraction

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
  // Map occupancy_rate to occupancy column (convert decimal to percentage)
  if (property_info.occupancy_rate != null) {
    updateData.occupancy = property_info.occupancy_rate * 100
  }

  // Financial info
  if (financial_info.offer_price) updateData.offer_price = financial_info.offer_price
  if (financial_info.cap_rate) updateData.cap_rate = financial_info.cap_rate * 100 // Convert decimal to percentage

  // Store full extraction in metadata (includes returns_info, pro_forma_projections, sources_uses, etc.)
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
    console.error('[Classification API] Failed to update property:', error)
  } else {
    console.log('[Classification API] Updated property with OM data:', propertyId, {
      mapped_fields: ['name', 'address', 'city', 'state', 'zip_code', 'units', 'year_built', 'avg_sqft_per_unit', 'occupancy', 'offer_price', 'cap_rate'],
      has_returns_info: !!returns_info?.irr,
      has_pro_forma: !!extraction.pro_forma_projections?.length,
      has_sources_uses: !!extraction.sources_uses,
    })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
