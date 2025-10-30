"use client"

import type React from "react"
import { ChevronDown, ChevronRight, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LineItem } from "./types"
import { calculateMonthlySum, months } from "./utils"

interface LineItemRowProps {
  item: LineItem
  items: LineItem[]
  setItems: React.Dispatch<React.SetStateAction<LineItem[]>>
  depth: number
  showMonthlyColumns: boolean
  lineItemColumnWidth: number
  totalUnits: number
  acceptedDiscrepancies: Set<string>
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

export function LineItemRow({
  item,
  items,
  setItems,
  depth,
  showMonthlyColumns,
  lineItemColumnWidth,
  totalUnits,
  acceptedDiscrepancies,
  onToggleExpand,
  onAcceptDiscrepancy,
  onUpdateLineItem,
  onHandlePerUnitChange,
  handleResizeStart,
}: LineItemRowProps) {
  const hasChildren = item.children && item.children.length > 0
  const majorTotalFontClass = item.isMajorTotal ? "font-bold text-xs" : item.isCalculated ? "font-semibold" : ""

  const getValidationStatus = () => {
    if (!item.docTotal || !item.monthlyData)
      return { isValid: true, discrepancy: 0, isAcceptable: true, isAccepted: false }
    const calcTotal = calculateMonthlySum(item.monthlyData)
    const discrepancy = item.docTotal - calcTotal
    const tolerance = 1
    const isValid = Math.abs(discrepancy) <= tolerance
    const absDiscrepancy = Math.abs(discrepancy)
    let isAcceptable = false
    if (absDiscrepancy <= 5) isAcceptable = true
    else if (item.annualAmount && item.annualAmount < 10000) isAcceptable = absDiscrepancy <= 20
    else if (item.annualAmount && item.annualAmount < 100000) isAcceptable = absDiscrepancy <= 100
    else isAcceptable = absDiscrepancy <= 100
    const isAccepted = acceptedDiscrepancies.has(item.id)
    return { isValid, discrepancy, isAcceptable, isAccepted }
  }

  const validation = getValidationStatus()
  const hasMismatch = !validation.isValid && !validation.isAccepted
  const isCategoryHeader = item.hasChildren && !item.isCalculated

  let rowBgClass = "bg-white"
  if (item.isMajorTotal) {
    rowBgClass = "bg-orange-50"
  } else if (item.isCalculated && !item.isMajorTotal) {
    rowBgClass = "bg-blue-50"
  }

  return (
    <>
      <tr
        className={`border-b hover:bg-gray-100/50 ${rowBgClass} ${
          item.isMajorTotal ? "font-bold text-sm" : item.isCalculated ? "font-semibold text-xs" : "text-xs"
        }`}
      >
        <td
          className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-xs sticky left-0 ${rowBgClass} z-10 border-r`}
          style={{
            width: `${lineItemColumnWidth}px`,
            minWidth: `${lineItemColumnWidth}px`,
            maxWidth: `${lineItemColumnWidth}px`,
            paddingLeft: `${4 + depth * 12}px`,
            paddingRight: "4px",
          }}
        >
          <div className="flex items-center gap-0.5 w-full">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpand(item.id)}
                className="p-0 h-4 w-4 hover:bg-gray-100 flex-shrink-0"
              >
                {item.isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            ) : (
              <div className="w-4 h-4 flex-shrink-0" />
            )}
            <span
              className={`${majorTotalFontClass} ${isCategoryHeader ? "font-semibold" : ""} truncate flex-1`}
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              title={item.name}
            >
              {item.name}
            </span>
            {item.hasFormula && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-blue-500 cursor-help flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-mono">{item.formula}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </td>

        <td
          className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[100px] min-w-[100px] max-w-[100px] border-r`}
        >
          {isCategoryHeader ? (
            <span className="text-gray-400">-</span>
          ) : item.isCalculated ? (
            <span className={`font-mono ${item.isMajorTotal ? "text-sm font-bold" : ""}`}>
              ${(item.perUnit ?? 0).toLocaleString()}
            </span>
          ) : (
            <Input
              type="number"
              value={item.perUnit ?? 0}
              onChange={(e) => onHandlePerUnitChange(items, setItems, item.id, e.target.value)}
              className="border-0 bg-transparent font-mono text-xs p-0 h-auto text-right"
            />
          )}
        </td>

        <td
          className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[120px] min-w-[120px] max-w-[120px] border-r text-blue-700`}
        >
          {isCategoryHeader ? (
            <span className="text-gray-400">-</span>
          ) : (
            <div className="flex items-center justify-end gap-1">
              {item.docTotal !== undefined && (
                <>
                  <span className={`font-mono ${item.isMajorTotal ? "text-sm font-bold" : ""}`}>
                    ${item.docTotal.toLocaleString()}
                  </span>
                  {hasMismatch ? (
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Discrepancy: ${Math.abs(validation.discrepancy).toLocaleString()}
                              <br />
                              Doc Total: ${item.docTotal.toLocaleString()}
                              <br />
                              Calc Total: ${calculateMonthlySum(item.monthlyData ?? {}).toLocaleString()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {validation.isAcceptable && !validation.isAccepted && (
                        <button
                          onClick={() =>
                            onAcceptDiscrepancy(
                              item.id,
                              item.name,
                              item.docTotal ?? 0,
                              calculateMonthlySum(item.monthlyData),
                            )
                          }
                          className="text-xs px-1 py-0.5 bg-amber-500 text-white rounded hover:bg-amber-600"
                          title="Accept discrepancy"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  )}
                </>
              )}
            </div>
          )}
        </td>

        <td
          className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[120px] min-w-[120px] max-w-[120px] border-r ${
            hasMismatch ? "bg-yellow-100" : ""
          }`}
        >
          {isCategoryHeader ? (
            <span className="text-gray-400">-</span>
          ) : (
            <span className={`font-mono ${item.isMajorTotal ? "text-sm font-bold" : ""}`}>
              ${calculateMonthlySum(item.monthlyData ?? {}).toLocaleString()}
            </span>
          )}
        </td>

        {showMonthlyColumns &&
          item.monthlyData &&
          months.map((month) => (
            <td
              key={month}
              className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[90px] min-w-[90px] max-w-[90px] border-r`}
            >
              {isCategoryHeader ? (
                <span className="text-gray-400">-</span>
              ) : (
                <span className={`font-mono ${item.isMajorTotal ? "text-sm font-bold" : ""}`}>
                  {item.monthlyData?.[month] !== undefined ? item.monthlyData[month].toLocaleString() : "-"}
                </span>
              )}
            </td>
          ))}

        <td
          className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-left text-xs ${showMonthlyColumns ? "w-[150px] min-w-[150px]" : "w-[200px] min-w-[200px]"}`}
        >
          {isCategoryHeader || item.isCalculated ? (
            <span className="text-gray-400">-</span>
          ) : (
            <Input
              type="text"
              value={item.notes || ""}
              onChange={(e) => {
                const updateNotes = (items: LineItem[]): LineItem[] => {
                  return items.map((i) => {
                    if (i.id === item.id) {
                      return { ...i, notes: e.target.value }
                    }
                    if (i.children) {
                      return { ...i, children: updateNotes(i.children) }
                    }
                    return i
                  })
                }
                setItems(updateNotes(items))
              }}
              placeholder="Add notes..."
              className="border-0 bg-transparent text-xs p-0 h-auto"
            />
          )}
        </td>
      </tr>
      {hasChildren && item.isExpanded && (
        <>
          {item.children?.map((child) => (
            <LineItemRow
              key={child.id}
              item={child}
              items={items}
              setItems={setItems}
              depth={depth + 1}
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
        </>
      )}
    </>
  )
}
