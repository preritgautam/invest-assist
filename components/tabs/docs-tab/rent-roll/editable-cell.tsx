"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Check, X, Pencil } from "lucide-react"

interface EditableCellProps {
  value: string | number
  rowIndex: number
  columnName: string
  onSave: (newValue: string) => Promise<void>
  isReadOnly?: boolean
  isStatusColumn?: boolean
  statusClass?: string
}

export function EditableCell({
  value,
  rowIndex,
  columnName,
  onSave,
  isReadOnly = false,
  isStatusColumn = false,
  statusClass = "",
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value || ""))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const displayValue = value === null || value === undefined || 
                       value === "NA" || value === "N/A" || 
                       String(value).toUpperCase() === "NA" ? "-" : String(value)

  const handleSave = async () => {
    if (editValue === displayValue) {
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      await onSave(editValue)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
      setEditValue(displayValue)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(displayValue)
    setIsEditing(false)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isStatusColumn && !isEditing) {
    return (
      <div className="flex items-center justify-between gap-1 group py-1">
        <span className={statusClass}>{displayValue}</span>
        {!isReadOnly && (
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
            title="Edit status"
          >
            <Pencil className="h-3 w-3 text-gray-500" />
          </button>
        )}
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-0.5">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="h-7 text-xs py-0 px-2 flex-1"
          placeholder="Enter value..."
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 hover:bg-gray-200 disabled:opacity-50 rounded"
          title="Save"
        >
          <Check className="h-3 w-3 text-green-600" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 hover:bg-gray-200 disabled:opacity-50 rounded"
          title="Cancel"
        >
          <X className="h-3 w-3 text-red-600" />
        </button>
      </div>
    )
  }
console.log("rendering editable cell with value:");
  return (
    <div className="flex items-center justify-between gap-1 group py-1 px-2 rounded hover:bg-gray-100 transition-colors">
      <span className="flex-1 truncate text-sm">{displayValue}</span>
      {!isReadOnly && (
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
          title={`Edit ${columnName}`}
        >
          <Pencil className="h-3 w-3 text-gray-500" />
        </button>
      )}
      {error && (
        <div className="text-red-500 text-xs whitespace-nowrap absolute top-8">
          {error}
        </div>
      )}
    </div>
  )
}
