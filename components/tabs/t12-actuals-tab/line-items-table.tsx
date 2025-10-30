"use client"

import type React from "react"
import type { LineItem } from "./types"
import { LineItemRow } from "./line-item-row"
import { months } from "./utils"

interface LineItemsTableProps {
  title: string
  items: LineItem[]
  setItems: React.Dispatch<React.SetStateAction<LineItem[]>>
  showMonthlyColumns: boolean
  lineItemColumnWidth: number
  totalUnits: number
  acceptedDiscrepancies: Set<string>
  mobileSection: "income" | "expense" | "noi"
  visibleSection: "income" | "expense"
  onToggleExpand: (id: string) => void
  onAcceptDiscrepancy: (itemId: string, itemName: string, docTotal: number, calcTotal: number) => void
  onUpdateLineItem: (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    field: keyof LineItem,
    value: string | number | boolean,
  ) => void
  onHandlePerUnitChange: (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    value: string,
  ) => void
  handleResizeStart: (e: React.MouseEvent | React.TouchEvent) => void
}

export function LineItemsTable({
  title,
  items,
  setItems,
  showMonthlyColumns,
  lineItemColumnWidth,
  totalUnits,
  acceptedDiscrepancies,
  mobileSection,
  visibleSection,
  onToggleExpand,
  onAcceptDiscrepancy,
  onUpdateLineItem,
  onHandlePerUnitChange,
  handleResizeStart,
}: LineItemsTableProps) {
  return (
    <div className={`${mobileSection !== visibleSection ? "hidden md:block" : ""}`}>
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 px-2">{title}</h3>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-none">
          <table className="w-full text-xs table-auto" style={{ minWidth: showMonthlyColumns ? "1400px" : "600px" }}>
            <thead className="bg-gray-50 border-b sticky top-0 z-20">
              <tr>
                <th
                  className="p-2 text-left font-semibold border-r sticky left-0 bg-gray-50 z-20"
                  style={{
                    width: `${lineItemColumnWidth}px`,
                    minWidth: `${lineItemColumnWidth}px`,
                    maxWidth: `${lineItemColumnWidth}px`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">Line Item</span>
                    <div
                      onMouseDown={handleResizeStart}
                      onTouchStart={handleResizeStart}
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500 bg-gray-300 transition-colors touch-none"
                      title="Drag to resize column"
                    />
                  </div>
                </th>
                <th className="p-2 text-right font-semibold border-r w-[100px] min-w-[100px] max-w-[100px]">
                  Per Unit
                </th>
                <th className="p-2 text-right font-semibold border-r text-blue-700 w-[120px] min-w-[120px] max-w-[120px]">
                  Doc Total
                </th>
                <th className="p-2 text-right font-semibold border-r text-green-700 w-[120px] min-w-[120px] max-w-[120px]">
                  Calc Total
                </th>
                {showMonthlyColumns &&
                  months.map((month) => (
                    <th
                      key={month}
                      className="p-2 text-right font-semibold w-[90px] min-w-[90px] max-w-[90px] border-r"
                    >
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </th>
                  ))}
                <th
                  className={`p-2 text-left font-semibold ${showMonthlyColumns ? "w-[150px] min-w-[150px]" : "w-[200px] min-w-[200px]"}`}
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  items={items}
                  setItems={setItems}
                  depth={0}
                  showMonthlyColumns={showMonthlyColumns}
                  lineItemColumnWidth={lineItemColumnWidth}
                  totalUnits={totalUnits}
                  acceptedDiscrepancies={acceptedDiscrepancies}
                  onToggleExpand={onToggleExpand}
                  onAcceptDiscrepancy={onAcceptDiscrepancy}
                  onUpdateLineItem={onUpdateLineItem}
                  onHandlePerUnitChange={onHandlePerUnitChange}
                  handleResizeStart={handleResizeStart}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
