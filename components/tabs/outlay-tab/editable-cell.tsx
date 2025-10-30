/**
 * Editable Cell Component
 * Provides inline editing functionality for table cells
 */

"use client"

import { Input } from "@/components/ui/input"
import type { EditableCellProps } from "./types"
import { formatCurrency, parseCurrency } from "./utils"

export function EditableCell({ value, type = "text", cellId, onUpdate }: EditableCellProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const isEditing = editingCell === cellId

  if (isEditing) {
    return (
      <Input
        type={type === "currency" || type === "number" ? "text" : "text"}
        value={type === "currency" ? formatCurrency(Number(value)) : value}
        onChange={(e) => {
          const newValue = type === "currency" ? parseCurrency(e.target.value) : e.target.value
          onUpdate(newValue)
        }}
        onBlur={() => setEditingCell(null)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            setEditingCell(null)
          }
        }}
        className="h-8 text-xs"
        autoFocus
      />
    )
  }

  return (
    <div className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => setEditingCell(cellId)}>
      {type === "currency" ? `$${formatCurrency(Number(value))}` : value}
    </div>
  )
}

import { useState } from "react"
