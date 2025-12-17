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
      console.error('[Documents API Update] Failed to insert user:', insertError)
    } else {
      console.log('[Documents API Update] User inserted successfully:', user.id)
    }
  } else {
    console.log('[Documents API Update] User already exists:', user.id)
  }

  return user.id
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Documents API Update] Request received')

    const userId = await getUserIdAndEnsureUserExists()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Documents API Update] Authenticated user ID:', { userId })

    const supabase = await createClient()
    const body = await request.json()
    const {
      processId,
      extractionStatus,
      extractionResult,
      errorMessage,
      documentId,
    } = body

    console.log('[Documents API Update] Received data:', {
      processId,
      extractionStatus,
      errorMessage,
    })

    // Validate required fields
    if (!processId) {
      return NextResponse.json(
        { error: 'Missing required field: processId' },
        { status: 400 }
      )
    }

    console.log(`[Documents API Update] Updating document status`)

    // Check if document exists
    const { data: existing } = await supabase
      .from('documents')
      .select('id, user_id, process_id')
      .eq('process_id', processId)
      .eq('user_id', userId)
      .single()

    // If document doesn't exist, create it
    if (!existing) {
      console.log('[Documents API Update] Document not found, creating placeholder document for processId:', processId)

      const now = new Date().toISOString()
      const { data: created, error: createError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          process_id: processId,
          document_id: documentId || null,
          filename: 'Unknown Document',
          document_type: 'unknown',
          upload_status: 'pending',
          extraction_status: 'pending',
          created_at: now,
          updated_at: now,
        })
        .select('id, user_id, process_id')
        .single()

      if (createError) {
        // If duplicate, try to fetch again
        if (createError.code === '23505') {
          const { data: retry } = await supabase
            .from('documents')
            .select('id, user_id, process_id')
            .eq('process_id', processId)
            .eq('user_id', userId)
            .single()

          if (!retry) {
            return NextResponse.json(
              { error: 'Failed to create or find document' },
              { status: 500 }
            )
          }
        } else {
          throw new Error(createError.message)
        }
      } else {
        console.log('[Documents API Update] Created placeholder document:', created)
      }
    } else {
      console.log('[Documents API Update] Document found:', existing)
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (extractionStatus) {
      updateData.extraction_status = extractionStatus
      // Also update upload_status when extraction completes or fails
      if (extractionStatus === 'completed') {
        updateData.upload_status = 'completed'
      } else if (extractionStatus === 'failed') {
        updateData.upload_status = 'failed'
      } else if (extractionStatus === 'processing') {
        updateData.upload_status = 'processing'
      }
    }
    if (extractionResult) updateData.extraction_result = extractionResult
    if (errorMessage) updateData.error_message = errorMessage
    if (documentId) updateData.document_id = documentId

    const { data: document, error: updateError } = await supabase
      .from('documents')
      .update(updateData)
      .eq('process_id', processId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    console.log('[Documents API Update] Document updated:', document)

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[Documents API Update] Error updating document:', error)

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
