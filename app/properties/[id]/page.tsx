"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface PropertiesRootPageProps {
  params: {
    id: string
  }
}

export default function PropertiesRootPage({ params }: PropertiesRootPageProps) {
  const { id } = params
  const router = useRouter()

  useEffect(() => {
    // Redirect to documents tab by default
    router.replace(`/properties/${id}/documents`)
  }, [id, router])

  return null
}
