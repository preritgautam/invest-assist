// app/property/[id]/page.tsx
import { redirect } from "next/navigation"

type Props = { params: { id: string } }

export default function PropertyIndex({ params }: Props) {
  redirect(`/property/${encodeURIComponent(params.id)}/docs`)
}
