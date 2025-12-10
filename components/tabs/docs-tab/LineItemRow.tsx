// components/line-item/LineItemRow.tsx
"use client"

import React from "react"
import type { ReactNode } from "react"
import { ChevronDown, ChevronRight, Plus, MessageSquare } from "lucide-react"
import { formatNumber } from "@/lib/format-currency"

/**
 * Types - adapt to your app's real types if you already have them.
 */
export type LineItem = {
  id: string
  name: string
  level: number // 0 = major category, 1 = subcategory, 2 = line item
  isCategory?: boolean
  children?: LineItem[]
  isExpanded?: boolean
  showMonthly?: boolean
  t12Actual: number
  underwriting?: number | null
  underwritingNote?: string | null
  proForma: number[] // pro forma years
  t12Monthly?: number[] // array of 12 months
}

export type ActiveDocument = {
  holdPeriod?: number // used for colspan calculation; default to 7 if missing in parent code
}

/**
 * Props for LineItemRow
 */
export type LineItemRowProps = {
  item: LineItem
  depth?: number
  activeDocument?: ActiveDocument | null
  onToggleExpand: (id: string) => void
  onToggleMonthly: (id: string) => void
  onUpdateMonthly?: (itemId: string, monthIndex: number, newValue: number) => void
  // optional render hook so parent can inject custom nodes (e.g. actions)
  renderExtra?: (item: LineItem) => ReactNode
}

/**
 * LineItemRow - renders a single line item row, monthly breakdown row (if shown)
 * and recursively renders children when expanded.
 */
export default React.memo(function LineItemRow({
  item,
  depth = 0,
  activeDocument = null,
  onToggleExpand,
  onToggleMonthly,
  onUpdateMonthly,
  renderExtra,
}: LineItemRowProps) {
  const paddingLeft = depth * 24
  const isMajorCategory = item.level === 0
  const isSubcategory = item.level === 1
  const isLineItem = item.level === 2

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return (
    <React.Fragment key={item.id}>
      <tr
        className={`border-b border-gray-200 hover:bg-gray-50 ${
          isMajorCategory ? "bg-blue-50 font-bold" : isSubcategory ? "bg-gray-50 font-semibold" : ""
        }`}
      >
        {/* Expand/Collapse + Line Item Name */}
        <td className="border-r border-gray-200 p-2 sticky left-0 bg-inherit z-10" style={{ paddingLeft }}>
          <div className="flex items-center gap-2">
            {item.isCategory && item.children && (
              <button
                onClick={() => onToggleExpand(item.id)}
                className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                title={item.isExpanded ? "Collapse category" : "Expand category"}
              >
                {item.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}

            {!item.isCategory && (
              <button
                onClick={() => onToggleMonthly(item.id)}
                className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                title={item.showMonthly ? "Hide monthly breakdown" : "Show monthly breakdown (click to see T-12 values)"}
              >
                {item.showMonthly ? <ChevronDown className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </button>
            )}

            <span className={`${isMajorCategory ? "text-sm" : "text-xs"}`}>{item.name}</span>

            {renderExtra?.(item)}
          </div>
        </td>

        {/* T-12 Actual */}
        <td className="border-r border-gray-200 p-2 text-right font-mono text-xs">
          <span className={item.t12Actual < 0 ? "text-red-600" : ""}>
            {item.t12Actual < 0 ? `($${Math.abs(item.t12Actual).toLocaleString('en-US')})` : `$${item.t12Actual.toLocaleString('en-US')}`}
          </span>
        </td>

        {/* Underwriting */}
        <td className="border-r border-gray-200 p-2 text-right font-mono text-xs bg-blue-50">
          <div className="flex items-center justify-end gap-1">
            <span className={item.underwriting && item.underwriting < 0 ? "text-red-600" : ""}>
              {item.underwriting
                ? item.underwriting < 0
                  ? `($${Math.abs(item.underwriting).toLocaleString('en-US')})`
                  : `$${item.underwriting.toLocaleString('en-US')}`
                : "-"}
            </span>
           {item.underwritingNote && (
  <MessageSquare
    className="w-3 h-3 text-blue-500"
    role="img"
    aria-label={item.underwritingNote}
  />
)}

          </div>
        </td>

        {/* Pro Forma Years */}
        {item.proForma.map((value, idx) => (
          <td key={idx} className="border-r border-gray-200 p-2 text-right font-mono text-xs bg-green-50">
            <span className={value < 0 ? "text-red-600" : ""}>
              {value < 0 ? `($${Math.abs(value).toLocaleString('en-US')})` : `$${value.toLocaleString('en-US')}`}
            </span>
          </td>
        ))}
      </tr>

      {/* Monthly Breakdown Row */}
      {item.showMonthly && item.t12Monthly && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td
            className="border-r border-gray-200 p-2 text-xs text-gray-600 italic sticky left-0 bg-gray-50 z-10"
            style={{ paddingLeft: paddingLeft + 32 }}
          >
            Monthly Breakdown (T-12)
          </td>

          {/* compute colspan:
              original code used: colSpan={1 + (activeDocument?.holdPeriod || 7) + 1}
              keep same logic but ensure numeric
          */}
          <td colSpan={1 + (Number(activeDocument?.holdPeriod ?? 7) || 7) + 1} className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    {months.map((month) => (
                      <th key={month} className="border-r border-gray-200 p-1 text-center font-medium text-gray-600">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {item.t12Monthly.map((value, idx) => {
                      const monthName = months[idx] ?? `M${idx + 1}`
                      return (
                        <td
                          key={idx}
                          className="border-r border-gray-200 p-1 text-right font-mono text-xs hover:bg-blue-50 cursor-pointer"
                          title={`Double-click to edit ${monthName}`}
                          onDoubleClick={(e) => {
                            if (!onUpdateMonthly) {
                              // fallback behaviour (log) if parent didn't provide update handler
                              const promptValue = prompt(`Edit value for ${monthName}:`, String(value))
                              if (promptValue !== null) {
                                console.log(`[LineItemRow] Updated monthly value for ${item.id} ${monthName}: ${promptValue}`)
                              }
                              return
                            }

                            const promptValue = prompt(`Edit value for ${monthName}:`, String(value))
                            if (promptValue !== null) {
                              const parsed = Number(promptValue.replace(/[^0-9.-]+/g, ""))
                              if (!Number.isNaN(parsed)) {
                                onUpdateMonthly(item.id, idx, parsed)
                              } else {
                                alert("Please enter a valid number")
                              }
                            }
                          }}
                        >
                          <span className={value < 0 ? "text-red-600" : ""}>
                            {value === 0 ? "$0" : value < 0 ? `($${Math.abs(value).toLocaleString('en-US')})` : `$${value.toLocaleString('en-US')}`}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}

      {/* Render children recursively */}
      {item.isExpanded &&
        item.children?.map((child) => (
          <LineItemRow
            key={child.id}
            item={child}
            depth={depth + 1}
            activeDocument={activeDocument}
            onToggleExpand={onToggleExpand}
            onToggleMonthly={onToggleMonthly}
            onUpdateMonthly={onUpdateMonthly}
            renderExtra={renderExtra}
          />
        ))}
    </React.Fragment>
  )
})
