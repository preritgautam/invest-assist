"use client"

import { FileText, Lock } from "lucide-react"

interface DocumentHeaderProps {
  title: string
  isLocked?: boolean
}

export function DocumentHeader({ title, isLocked = false }: DocumentHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
      <FileText className="w-5 h-5 text-gray-600" />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {isLocked && <Lock className="w-4 h-4 text-gray-400 ml-auto" />}
    </div>
  )
}
