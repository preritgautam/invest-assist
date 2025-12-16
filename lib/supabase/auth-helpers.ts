import { createClient } from './server'

/**
 * Get the current authenticated user from Supabase
 * Returns the user ID or null if not authenticated
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get the current user ID or throw an error if not authenticated
 * Use this in protected API routes
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

/**
 * Get user ID - returns the authenticated user's ID or null
 */
export async function getUserId(): Promise<string | null> {
  const user = await getAuthenticatedUser()
  return user?.id ?? null
}
