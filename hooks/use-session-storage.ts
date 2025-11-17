import { useState, useEffect } from 'react'

/**
 * Custom hook to safely read from sessionStorage without causing hydration errors
 * Returns the value from sessionStorage after component mounts
 */
export function useSessionStorage<T>(key: string, initialValue: T): T {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true)
    
    // Try to get value from sessionStorage
    try {
      const saved = sessionStorage.getItem(key)
      if (saved) {
        setStoredValue(JSON.parse(saved))
      }
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error)
    }
  }, [key])

  return storedValue
}
