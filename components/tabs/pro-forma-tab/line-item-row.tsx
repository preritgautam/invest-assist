"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Minus, CheckCircle, AlertTriangle, Percent, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LineItemData, InputMode } from "./types"
import {
  formatCurrency,
  formatPerUnit,
  calculateMonthlySum,
  validateTotal,
  calculateVariance,
  getVarianceColor,
  calculateProjection,
} from "./utils"

interface LineItemRowProps {
  item: LineItemData
  categoryId: string
  globalInputMode: InputMode
  units: number
  showProjections: boolean
  holdPeriod: number
  isT12Expanded: boolean
  editingCell: { itemId: string; field: string } | null
  editValue: string
  onToggleT12: (itemId: string) => void
  onCellEdit: (itemId: string, field: string, value: string) => void
  onCellSave: () => void
  setEditValue: (value: string) => void
}

export function LineItemRow({
  item,
  categoryId,
  globalInputMode,
  units,
  showProjections,
  holdPeriod,
  isT12Expanded,
  editingCell,
  editValue,
  onToggleT12,
  onCellEdit,
  onCellSave,
  setEditValue,
}: LineItemRowProps) {
  const variance = calculateVariance(item.inPlace, item.yourUnderwriting)
  const isExpense = categoryId === "expenses"
  const hasMonthlyData = item.monthlyData && item.monthlyData.length > 0
  const isValidated = validateTotal(item.monthlyData, item.documentTotal)
  const calculatedTotal = calculateMonthlySum(item.monthlyData)

  return (
    <React.Fragment>
      <tr
        className={cn(
          "border-b border-gray-100 hover:bg-gray-50 transition-colors",
          item.isSubtotal && "bg-blue-50 font-semibold border-b-2 border-blue-200",
        )}
      >
        {/* Line Item Name */}
        <td className="sticky left-0 z-10 bg-white py-2 px-4 text-xs border-r border-gray-100">
          <div className="flex items-center gap-2">
            {hasMonthlyData && !item.isSubtotal && (
              <button
                onClick={() => onToggleT12(item.id)}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              >
                {isT12Expanded ? (
                  <Minus className="h-3 w-3 text-gray-600" />
                ) : (
                  <Plus className="h-3 w-3 text-gray-600" />
                )}
              </button>
            )}
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className={cn(item.isSubtotal && "font-bold text-sm")}>{item.label}</span>
                {item.inputType === "percent" && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    <Percent className="h-2 w-2 mr-0.5" />
                    {item.percentBase}
                  </Badge>
                )}
                {hasMonthlyData && !item.isSubtotal && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {isValidated ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div>Document Total: {formatCurrency(item.documentTotal || 0)}</div>
                          <div>Calculated Total: {formatCurrency(calculatedTotal)}</div>
                          <div className="mt-1 font-semibold">
                            {isValidated ? "✓ Totals match" : "⚠ Totals differ - check OCR"}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {item.formula && <span className="text-[9px] text-gray-500 italic mt-0.5">{item.formula}</span>}
              {item.growthRate !== undefined && item.growthRate > 0 && (
                <span className="text-[9px] text-blue-600 mt-0.5">Growth: {item.growthRate}% annually</span>
              )}
            </div>
          </div>
        </td>

        {/* In-Place */}
        <td className="py-2 px-3 text-xs text-right border-r border-gray-100">
          <div className="flex flex-col items-end">
            <span className={cn(item.inPlace < 0 && "text-red-600")}>
              {globalInputMode === "perUnit" && !item.isSubtotal
                ? formatPerUnit(item.inPlace, units)
                : formatCurrency(item.inPlace)}
            </span>
            {item.inputType === "percent" && (
              <span className="text-[9px] text-gray-500">
                {((item.inPlace / (item.inPlace + 1000000)) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </td>

        {/* Your Underwriting */}
        <td className="py-2 px-3 text-xs text-right border-r border-gray-100">
          {editingCell?.itemId === item.id && editingCell?.field === "yourUnderwriting" ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={onCellSave}
              onKeyDown={(e) => e.key === "Enter" && onCellSave()}
              className="h-7 text-xs text-right"
              autoFocus
            />
          ) : (
            <div
              className="flex flex-col items-end"
              onDoubleClick={() =>
                item.isEditable && onCellEdit(item.id, "yourUnderwriting", item.yourUnderwriting.toString())
              }
            >
              <span
                className={cn(
                  item.yourUnderwriting < 0 && "text-red-600",
                  item.isEditable && "cursor-pointer hover:bg-yellow-50 px-1 rounded",
                )}
              >
                {globalInputMode === "perUnit" && !item.isSubtotal
                  ? formatPerUnit(item.yourUnderwriting, units)
                  : formatCurrency(item.yourUnderwriting)}
              </span>
              {item.inputType === "percent" && (
                <span className="text-[9px] text-gray-500">
                  {((item.yourUnderwriting / (item.yourUnderwriting + 1000000)) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </td>

        {/* Variance */}
        <td className="py-2 px-3 text-xs text-center border-r border-gray-100">
          <div
            className={cn(
              "inline-flex flex-col items-center px-2 py-1 rounded",
              getVarianceColor(variance.dollar, isExpense),
            )}
          >
            <div className="flex items-center gap-1">
              {variance.dollar > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : variance.dollar < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span className="font-semibold">
                {variance.dollar > 0 && "+"}
                {formatCurrency(variance.dollar, true)}
              </span>
            </div>
            <span className="text-[9px]">
              {variance.percent > 0 && "+"}
              {variance.percent.toFixed(1)}%
            </span>
          </div>
        </td>

        {/* Year Projections */}
        {showProjections &&
          Array.from({ length: holdPeriod }, (_, i) => i + 1).map((year) => {
            const projectedValue = calculateProjection(item.yourUnderwriting, item.growthRate || 0, year)
            return (
              <td key={year} className="py-2 px-3 text-xs text-right border-r border-gray-100 bg-blue-50/30">
                <span className={cn(projectedValue < 0 && "text-red-600")}>
                  {globalInputMode === "perUnit" && !item.isSubtotal
                    ? formatPerUnit(projectedValue, units)
                    : formatCurrency(projectedValue)}
                </span>
              </td>
            )
          })}
      </tr>

      {/* T12 Expansion */}
      {isT12Expanded && hasMonthlyData && (
        <tr className="bg-gray-50">
          <td colSpan={4 + (showProjections ? holdPeriod : 0)} className="py-2 px-4 border-b border-gray-200">
            <div className="ml-8 p-3 bg-white rounded border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-700">Trailing 12 Months Breakdown</h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Document: {formatCurrency(item.documentTotal || 0)}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">Calculated: {formatCurrency(calculatedTotal)}</span>
                  {isValidated ? (
                    <CheckCircle className="h-3 w-3 text-green-600 ml-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-600 ml-1" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {item.monthlyData?.map((month) => (
                  <div key={month.month} className="flex flex-col items-center p-2 bg-gray-50 rounded">
                    <span className="text-[10px] text-gray-500 font-medium">{month.month}</span>
                    <span className="text-xs font-semibold text-gray-900 mt-1">
                      {formatCurrency(month.value, true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  )
}
