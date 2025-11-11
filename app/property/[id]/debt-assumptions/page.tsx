// app/property/[id]/debt-assumptions/page.tsx
import { CapitalTab } from "@/components/tabs/capital-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyCapitalPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <CapitalTab property={property} />
}
