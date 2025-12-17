import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw { message: "Not authenticated", status: 401 }
  }
  return user.id
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getUserId()
    const supabase = await createClient()

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .select('id, owner_id, name, description, payload, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error || !scenario) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (scenario.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ scenario })
  } catch (err: any) {
    console.error("GET /api/scenarios/[id] error:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getUserId()
    const supabase = await createClient()
    const body = await request.json()
    const { name, description, payload } = body || {}

    // Fetch existing to check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('scenarios')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (existing.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (payload !== undefined) updateData.payload = payload

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .update(updateData)
      .eq('id', id)
      .select('id, owner_id, name, description, payload, created_at, updated_at')
      .single()

    if (error) {
      console.error("PUT /api/scenarios/[id] error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scenario })
  } catch (err: any) {
    console.error("PUT /api/scenarios/[id] error:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getUserId()
    const supabase = await createClient()

    // Fetch existing to check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('scenarios')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (existing.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete
    const { error } = await supabase
      .from('scenarios')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error("DELETE /api/scenarios/[id] error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("DELETE /api/scenarios/[id] error:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    )
  }
}
