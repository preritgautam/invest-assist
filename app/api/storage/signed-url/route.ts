import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'documents'
const SIGNED_URL_EXPIRY = 3600 // 1 hour in seconds

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

// POST /api/storage/signed-url - Get a signed URL for a file
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
    const { storagePath, documentId } = body

    if (!storagePath && !documentId) {
      return NextResponse.json(
        { error: 'Either storagePath or documentId is required' },
        { status: 400 }
      )
    }

    let pathToSign = storagePath

    // If documentId provided, look up the storage path
    if (documentId && !storagePath) {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_path, company_id')
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

      pathToSign = document.storage_path
    }

    // Verify the path belongs to user's company (path format: {company_id}/{property_id}/{filename})
    if (!pathToSign.startsWith(`${companyId}/`)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(pathToSign, SIGNED_URL_EXPIRY)

    if (signedUrlError) {
      console.error('[Storage API] Signed URL error:', signedUrlError)
      return NextResponse.json(
        { error: `Failed to generate signed URL: ${signedUrlError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
    }, { status: 200 })

  } catch (error) {
    console.error('[Storage API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
