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

// GET: list scenarios for current user
export async function GET() {
  try {
    const userId = await getUserId()
    const supabase = await createClient()

    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('id, owner_id, name, description, payload, created_at, updated_at')
      .eq('owner_id', userId)
      .eq('deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("GET /api/scenarios error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scenarios })
  } catch (err: any) {
    console.error("GET /api/scenarios error:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    )
  }
}

// POST: create scenario for current user
export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    const supabase = await createClient()
    const body = await request.json()

    const { name, description, payload } = body || {}
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const { data: scenario, error } = await supabase
      .from('scenarios')
      .insert({
        owner_id: userId,
        name,
        description: description || null,
        payload: payload || {},
      })
      .select('id, owner_id, name, description, payload, created_at, updated_at')
      .single()

    if (error) {
      console.error("POST /api/scenarios error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scenario }, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/scenarios error:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    )
  }
}
