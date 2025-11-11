// app/property/[id]/returns/page.tsx
import { ReturnsTab } from "@/components/tabs/returns-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyReturnsPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <ReturnsTab property={property} />
}
