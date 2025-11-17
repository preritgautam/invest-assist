import type { ReactNode } from "react"

interface PropertiesLayoutProps {
  children: ReactNode
  params: Promise<{
    id: string
  }>
}

export default async function PropertiesLayout({ children, params }: PropertiesLayoutProps) {
  const { id } = await params

  return <>{children}</>
}
