"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { DocumentsTab } from "@/components/tabs/docs-tab/docs-tab"

interface DocumentsPageProps {
  params: {
    id: string
  }
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { id } = params

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="documents">
      {(property, isLoading) => <DocumentsTab property={property} propertyId={id} isLoading={isLoading} />}
    </PropertyLayoutWrapper>
  )
}
