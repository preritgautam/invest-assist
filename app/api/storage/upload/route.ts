import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

const BUCKET_NAME = 'documents'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]

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

// POST /api/storage/upload - Upload a file to Supabase Storage
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const propertyId = formData.get('propertyId') as string | null
    const documentType = formData.get('documentType') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed: PDF, Excel, Images` },
        { status: 400 }
      )
    }

    // Verify property belongs to user's company
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || ''
    const uniqueFilename = `${uuidv4()}.${fileExtension}`

    // Create storage path: {company_id}/{property_id}/{unique_filename}
    const storagePath = `${companyId}/${propertyId}/${uniqueFilename}`

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[Storage API] Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Create document record in database
    const processId = uuidv4()
    const now = new Date().toISOString()

    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        company_id: companyId,
        property_id: propertyId,
        process_id: processId,
        filename: file.name,
        file_size: file.size,
        storage_path: storagePath,
        document_type: documentType || null,
        upload_status: 'completed',
        extraction_status: 'pending',
        classification_status: documentType ? 'completed' : 'pending',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (docError) {
      console.error('[Storage API] Document insert error:', docError)
      // Try to delete the uploaded file if document insert fails
      await supabase.storage.from(BUCKET_NAME).remove([storagePath])
      return NextResponse.json(
        { error: `Failed to create document record: ${docError.message}` },
        { status: 500 }
      )
    }

    console.log('[Storage API] File uploaded:', storagePath, 'Document ID:', document.id)

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        storage_path: document.storage_path,
        process_id: document.process_id,
      },
    }, { status: 201 })

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
