"use client"

import { use } from "react"
import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { ProFormaTab } from "@/components/tabs/pro-forma-tab"
import { getPropertyById } from "@/lib/property-data"

interface ProFormaPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProFormaPage({ params }: ProFormaPageProps) {
  const { id } = use(params)
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="pro-forma">
      <ProFormaTab property={property} />
    </PropertyLayoutWrapper>
  )
}
