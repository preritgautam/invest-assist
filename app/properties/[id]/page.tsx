import { redirect } from "next/navigation"

interface PropertiesRootPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PropertiesRootPage({ params }: PropertiesRootPageProps) {
  const { id } = await params
  
  // Server-side redirect for instant navigation without client-side rendering
  redirect(`/properties/${id}/documents`)
}
