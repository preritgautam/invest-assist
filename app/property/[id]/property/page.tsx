// app/property/[id]/property/page.tsx
import { PropertyTab } from "@/components/tabs/property-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyInfoPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <PropertyTab property={property} />
}
