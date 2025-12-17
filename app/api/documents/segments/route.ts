import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

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

// POST /api/documents/segments - Create segment document records from a source document
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
    const { sourceDocumentId, segments } = body

    if (!sourceDocumentId || !segments || !Array.isArray(segments)) {
      return NextResponse.json(
        { error: 'sourceDocumentId and segments array are required' },
        { status: 400 }
      )
    }

    // Get source document
    const { data: sourceDoc, error: sourceError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', sourceDocumentId)
      .single()

    if (sourceError || !sourceDoc) {
      return NextResponse.json(
        { error: 'Source document not found' },
        { status: 404 }
      )
    }

    // Verify document belongs to user's company
    if (sourceDoc.company_id !== companyId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Mark source document as source file
    await supabase
      .from('documents')
      .update({
        is_source_file: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceDocumentId)

    // Create segment records
    const createdSegments = []
    const now = new Date().toISOString()

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const processId = uuidv4()

      // Generate a descriptive filename for the segment
      const baseName = sourceDoc.filename.replace(/\.[^/.]+$/, '') // Remove extension
      const ext = sourceDoc.filename.split('.').pop() || 'pdf'
      const periodLabel = segment.period_info?.period_label || ''
      const segmentFilename = periodLabel
        ? `${baseName} - ${segment.type.replace('_', ' ')} (${periodLabel}).${ext}`
        : `${baseName} - ${segment.type.replace('_', ' ')} (${segment.page_range}).${ext}`

      const { data: segmentDoc, error: segmentError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          company_id: companyId,
          property_id: sourceDoc.property_id,
          process_id: processId,
          filename: segmentFilename,
          file_size: sourceDoc.file_size, // Same file, different segment
          storage_path: sourceDoc.storage_path, // Points to same file
          document_type: segment.type,
          page_range: segment.page_range,
          sheet_index: segment.sheet_index ?? null,
          upload_status: 'completed',
          extraction_status: 'pending',
          classification_status: 'completed', // Already classified
          classification_result: {
            document_type: segment.type,
            confidence: segment.confidence,
            segments: [segment], // Store the segment info
          },
          // Segment tracking
          is_source_file: false,
          source_document_id: sourceDocumentId,
          total_pages: sourceDoc.total_pages,
          // Period/date info
          document_date: segment.period_info?.document_date || null,
          period_start: segment.period_info?.period_start || null,
          period_end: segment.period_info?.period_end || null,
          period_label: segment.period_info?.period_label || null,
          // Active and order
          is_active: true,
          segment_order: i,
          // Timestamps
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (segmentError) {
        console.error('[Segments API] Error creating segment:', segmentError)
        continue // Continue with other segments
      }

      createdSegments.push(segmentDoc)
      console.log('[Segments API] Created segment:', segmentDoc.id, segment.type, segment.page_range)
    }

    console.log(`[Segments API] Created ${createdSegments.length} segments from source ${sourceDocumentId}`)

    return NextResponse.json({
      success: true,
      segments: createdSegments,
    }, { status: 201 })

  } catch (error) {
    console.error('[Segments API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
