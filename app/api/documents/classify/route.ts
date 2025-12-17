import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ClassificationResult, DocumentSegment } from '@/lib/supabase/database.types'

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

    // Determine MIME type
    const filename = document.filename.toLowerCase()
    let mimeType = 'application/pdf'
    if (filename.endsWith('.xlsx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    } else if (filename.endsWith('.xls')) {
      mimeType = 'application/vnd.ms-excel'
    } else if (filename.endsWith('.png')) {
      mimeType = 'image/png'
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      mimeType = 'image/jpeg'
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
        classification_result: classificationResult,
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

    return NextResponse.json({
      success: true,
      classification: classificationResult,
    }, { status: 200 })

  } catch (error) {
    console.error('[Classification API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
