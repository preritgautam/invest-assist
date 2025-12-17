"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface PropertiesRootPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PropertiesRootPage({ params }: PropertiesRootPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    // Redirect to documents tab by default
    router.replace(`/properties/${id}/documents`)
  }, [id, router])

  return null
}
