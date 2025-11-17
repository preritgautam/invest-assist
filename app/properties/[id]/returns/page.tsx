"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { ReturnsTab } from "@/components/tabs/returns-tab"
import { getPropertyById } from "@/lib/property-data"
import { use } from "react"

interface ReturnsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ReturnsPage({ params }: ReturnsPageProps) {
  const { id } = use(params)
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="returns">
      <ReturnsTab property={property} />
    </PropertyLayoutWrapper>
  )
}
