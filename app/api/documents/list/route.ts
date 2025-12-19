import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

async function getUserId() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  return user.id
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const documentType = searchParams.get('documentType')
    const uploadStatus = searchParams.get('uploadStatus')
    const propertyId = searchParams.get('propertyId')

    console.log(`[Documents API] Fetching for user: ${userId}, propertyId: ${propertyId || 'all'}`)

    // Build query
    let query = supabase
      .from('documents')
      .select('id, user_id, process_id, document_id, filename, document_type, file_size, upload_status, extraction_status, created_at, updated_at, property_id', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)

    // Filter by property_id if provided and valid UUID
    // Skip filter for mock data IDs (non-UUIDs) to avoid database errors
    if (propertyId && isValidUUID(propertyId)) {
      query = query.eq('property_id', propertyId)
    } else if (propertyId) {
      // Non-UUID propertyId indicates mock data - return empty results gracefully
      console.log(`[Documents API] Skipping non-UUID propertyId: ${propertyId} (likely mock data)`)
      return NextResponse.json({
        success: true,
        documents: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
        message: 'Mock property - no documents in database',
      })
    }

    if (documentType) {
      query = query.eq('document_type', documentType)
    }

    if (uploadStatus) {
      query = query.eq('upload_status', uploadStatus)
    }

    const { data: documents, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Documents API] Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const total = count || 0

    return NextResponse.json({
      success: true,
      documents: documents || [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

  } catch (error) {
    console.error('[Documents API] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
