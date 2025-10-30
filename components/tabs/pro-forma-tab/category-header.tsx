"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryHeaderProps {
  categoryId: string
  title: string
  color: string
  expanded: boolean
  onToggle: (categoryId: string) => void
  showProjections: boolean
  holdPeriod: number
}

export function CategoryHeader({
  categoryId,
  title,
  color,
  expanded,
  onToggle,
  showProjections,
  holdPeriod,
}: CategoryHeaderProps) {
  return (
    <tr className="border-t-2 border-gray-300 bg-gray-50">
      <td colSpan={4 + (showProjections ? holdPeriod : 0)} className={cn("py-2 px-4 border-l-4", color)}>
        <button
          onClick={() => onToggle(categoryId)}
          className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors w-full"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="text-sm font-bold text-gray-900">{title}</span>
        </button>
      </td>
    </tr>
  )
}
