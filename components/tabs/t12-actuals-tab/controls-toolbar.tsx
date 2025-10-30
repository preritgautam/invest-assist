"use client"

import { ChevronDown, ChevronRight, Plus } from "lucide-react"

interface ControlsToolbarProps {
  showMonthlyColumns: boolean
  setShowMonthlyColumns: (show: boolean) => void
  totalUnits: number
  setTotalUnits: (units: number) => void
  onAddLineItem: () => void
}

export function ControlsToolbar({
  showMonthlyColumns,
  setShowMonthlyColumns,
  totalUnits,
  setTotalUnits,
  onAddLineItem,
}: ControlsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <button
        onClick={() => setShowMonthlyColumns(!showMonthlyColumns)}
        className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
      >
        {showMonthlyColumns ? (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>Hide Monthly</span>
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4" />
            <span>Show Monthly</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="font-medium">Total Units:</span>
        <input
          type="number"
          value={totalUnits}
          onChange={(e) => setTotalUnits(Number.parseInt(e.target.value) || 0)}
          className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-center"
        />
      </div>

      <button
        onClick={onAddLineItem}
        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add Line Item</span>
      </button>
    </div>
  )
}
