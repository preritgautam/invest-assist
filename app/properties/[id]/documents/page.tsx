"use client"

import { use } from "react"
import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { DocumentsTab } from "@/components/tabs/docs-tab/docs-tab"

interface DocumentsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { id } = use(params)

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="documents">
      {(property, isLoading) => (
        <DocumentsTab property={property} propertyId={id} isLoading={isLoading} />
      )}
    </PropertyLayoutWrapper>
  )
}
