"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isUserLoggedIn, getUserEmailFromToken } from '@/lib/auth-utils'

/**
 * Hook to check if user is logged in
 * @param redirectIfNotLoggedIn - If true, redirects to sign-in if not logged in
 */
export function useAuth(redirectIfNotLoggedIn = false) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedIn = isUserLoggedIn()
    setIsLoggedIn(loggedIn)

    if (loggedIn) {
      const email = getUserEmailFromToken()
      setUserEmail(email)
    }

    if (!loggedIn && redirectIfNotLoggedIn) {
      router.push('/sign-in')
    }

    setIsLoading(false)
  }, [router, redirectIfNotLoggedIn])

  return {
    isLoggedIn,
    userEmail,
    isLoading,
  }
}
