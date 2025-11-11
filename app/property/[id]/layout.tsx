// app/property/[id]/layout.tsx
import React from "react"
import PropertyPageShell from "@/components/PropertyPageShell"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { children: React.ReactNode; params: { id: string } }

export default function PropertyLayout({ children, params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <PropertyPageShell property={property}>{children}</PropertyPageShell>
}
