import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type { Database }
export type Tables = Database['public']['Tables']

// Re-export types for convenience
export type User = Tables['users']['Row']
export type Scenario = Tables['scenarios']['Row']
export type Document = Tables['documents']['Row']

// Get Supabase client for use in API routes (respects auth)
export async function getSupabase() {
  return createClient()
}

// Get admin client (bypasses RLS - use for server-side operations)
export function getAdminSupabase() {
  return createAdminClient()
}

export default { getSupabase, getAdminSupabase }
