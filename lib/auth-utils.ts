/**
 * Authentication utility functions
 * These functions help manage authentication state
 */

/**
 * Check if user is logged in by checking for auth token in cookies
 */
export function isUserLoggedIn(): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  const cookies = document.cookie.split(';')
  return cookies.some(cookie => {
    const trimmed = cookie.trim()
    return trimmed.startsWith('authToken=') && trimmed !== 'authToken='
  })
}

/**
 * Set authentication token
 * @param email - User email to encode as token
 * @param daysToExpire - Days until token expires (default: 30)
 */
export function setAuthToken(email: string, daysToExpire: number = 30): void {
  if (typeof document === 'undefined') {
    return
  }

  const token = Buffer.from(email).toString('base64')
  const expirationMs = daysToExpire * 24 * 60 * 60 * 1000
  document.cookie = `authToken=${token}; path=/; max-age=${daysToExpire * 24 * 60 * 60}`
}

/**
 * Clear authentication token (logout)
 */
export function clearAuthToken(): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
}

/**
 * Get the current user email from auth token
 */
export function getUserEmailFromToken(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  try {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))

    if (!authCookie) {
      return null
    }

    const token = authCookie.split('=')[1]
    const email = Buffer.from(token, 'base64').toString('utf-8')
    return email
  } catch (error) {
    console.error('Error decoding auth token:', error)
    return null
  }
}
