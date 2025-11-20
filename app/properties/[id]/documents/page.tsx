"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { DocumentsTab } from "@/components/tabs/docs-tab/docs-tab"
import { getPropertyById } from "@/lib/property-data"
import { use } from "react"

interface DocumentsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { id } = use(params)
  const property = getPropertyById(id) || null

  if (!property) {
    // Detailed error message for debugging
    console.warn(`[DocumentsPage] Property not found for ID: "${id}"`)
  }

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="documents">
      <DocumentsTab property={property} />
    </PropertyLayoutWrapper>
  )
}
