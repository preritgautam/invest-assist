import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getUserIdAndEnsureUserExists() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }

  // Check if user already exists in users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingUser) {
    // Insert new user with only id and email (timestamps are auto-generated in DB)
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
      })

    if (insertError) {
      console.error('[Documents API Store] Failed to insert user:', insertError)
    } else {
      console.log('[Documents API Store] User inserted successfully:', user.id)
    }
  } else {
    console.log('[Documents API Store] User already exists:', user.id)
  }

  return user.id
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Documents API Store] ===== REQUEST RECEIVED =====')

    const userId = await getUserIdAndEnsureUserExists()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Documents API Store] Authenticated user ID:', { userId })

    const supabase = await createClient()
    const body = await request.json()
    const {
      processId,
      documentId,
      filename,
      documentType,
      fileSize,
      propertyId,
    } = body

    console.log('[Documents API Store] Received data:', {
      processId,
      documentId,
      filename,
      documentType,
      fileSize,
      propertyId,
    })

    // Validate required fields
    if (!processId || !filename) {
      console.log('[Documents API Store] Validation failed - missing processId or filename')
      return NextResponse.json(
        { error: 'Missing required fields: processId, filename' },
        { status: 400 }
      )
    }

    console.log(`[Documents API Store] About to store document for user ${userId} with processId ${processId}`)

    // Check if document with this process_id already exists
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('process_id', processId)
      .single()

    let document
    let error

    if (existing) {
      // Update existing document
      const updateData: Record<string, unknown> = {
        document_id: documentId || null,
        filename,
        document_type: documentType,
        file_size: fileSize || 0,
        updated_at: new Date().toISOString(),
      }
      // Only set property_id if provided (don't overwrite with null)
      if (propertyId) {
        updateData.property_id = propertyId
      }
      const result = await supabase
        .from('documents')
        .update(updateData)
        .eq('process_id', processId)
        .select()
        .single()

      document = result.data
      error = result.error
    } else {
      // Insert new document
      const now = new Date().toISOString()
      const result = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          process_id: processId,
          document_id: documentId || null,
          filename,
          document_type: documentType,
          file_size: fileSize || 0,
          property_id: propertyId || null,
          upload_status: 'pending',
          extraction_status: 'pending',
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      document = result.data
      error = result.error
    }

    if (error) {
      console.error('[Documents API Store] Database error:', error)
      throw new Error(error.message)
    }

    console.log('[Documents API Store] Document stored successfully:', {
      id: document.id,
      process_id: document.process_id,
      filename: document.filename,
      user_id: document.user_id,
    })

    console.log('[Documents API Store] ===== SUCCESS =====')
    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('[Documents API Store] ===== ERROR =====')
    console.error('[Documents API Store] Error:', error)

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
