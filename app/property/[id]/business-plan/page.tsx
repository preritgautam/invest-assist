// app/property/[id]/business-plan/page.tsx
import { PlanTab } from "@/components/tabs/plan-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyPlanPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <PlanTab property={property} />
}
