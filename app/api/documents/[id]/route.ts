import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawId = (id ?? "").trim()
    console.log(`[Document API] Fetching document with raw ID: "${rawId}"`)

    if (!rawId) {
      console.log("[Document API] Missing document ID")
      return NextResponse.json({ success: false, error: "Missing document id" }, { status: 400 })
    }

    const supabase = await createClient()

    const isNumeric = /^[0-9]+$/.test(rawId)
    const isUuidLike = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawId)

    let document = null
    let error = null

    if (isNumeric) {
      const result = await supabase
        .from('documents')
        .select('*')
        .eq('id', parseInt(rawId, 10))
        .is('deleted_at', null)
        .single()
      document = result.data
      error = result.error
    } else if (isUuidLike) {
      // Try document_id first
      let result = await supabase
        .from('documents')
        .select('*')
        .ilike('document_id', rawId)
        .is('deleted_at', null)
        .single()

      // If not found by document_id, try process_id
      if (!result.data) {
        result = await supabase
          .from('documents')
          .select('*')
          .eq('process_id', rawId)
          .is('deleted_at', null)
          .single()
      }
      document = result.data
      error = result.error
    } else {
      // Try process_id first (most common for new uploads), then document_id, then id as string
      let result = await supabase
        .from('documents')
        .select('*')
        .eq('process_id', rawId)
        .is('deleted_at', null)
        .single()

      if (!result.data) {
        result = await supabase
          .from('documents')
          .select('*')
          .ilike('document_id', rawId)
          .is('deleted_at', null)
          .single()
      }

      if (!result.data) {
        result = await supabase
          .from('documents')
          .select('*')
          .eq('id', rawId)
          .is('deleted_at', null)
          .single()
      }
      document = result.data
      error = result.error
    }

    if (error || !document) {
      console.log(`[Document API] Document not found: ${rawId}`)
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 })
    }

    console.log(`[Document API] Found document: ${document.filename} (id=${document.id})`)
    return NextResponse.json({ success: true, document })

  } catch (err) {
    console.error("[Document API] Error fetching document:", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

// PATCH - Update a document by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawId = (id ?? "").trim()

    if (!rawId) {
      return NextResponse.json({ success: false, error: "Missing document id" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = await getUserCompanyId(supabase, user.id)

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'User has no company' }, { status: 403 })
    }

    const body = await request.json()
    console.log(`[Document API] PATCH document ${rawId}:`, body)

    // Build update object - only include allowed fields
    const allowedFields = [
      'process_id', 'document_id', 'document_type', 'extraction_status',
      'extraction_result', 'classification_status', 'classification_result',
      'error_message', 'page_range', 'sheet_index', 'document_date',
      'period_start', 'period_end', 'period_label', 'is_active'
    ]

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Perform the update
    const isNumeric = /^[0-9]+$/.test(rawId)
    let result

    if (isNumeric) {
      result = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', parseInt(rawId, 10))
        .eq('company_id', companyId)
        .select()
        .single()
    } else {
      // Try to find by process_id or document_id
      result = await supabase
        .from('documents')
        .update(updateData)
        .eq('process_id', rawId)
        .eq('company_id', companyId)
        .select()
        .single()

      if (!result.data) {
        result = await supabase
          .from('documents')
          .update(updateData)
          .ilike('document_id', rawId)
          .eq('company_id', companyId)
          .select()
          .single()
      }
    }

    if (result.error || !result.data) {
      console.log(`[Document API] Document not found or update failed: ${rawId}`)
      return NextResponse.json({ success: false, error: "Document not found or update failed" }, { status: 404 })
    }

    console.log(`[Document API] Updated document: ${result.data.id}`)
    return NextResponse.json({ success: true, document: result.data })

  } catch (err) {
    console.error("[Document API] Error updating document:", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
