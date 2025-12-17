import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from('users')
      .select('*')

    if (error) {
      console.error('[Users API] Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (err) {
    console.error('[Users API] Error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
