"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3 } from "lucide-react"
import type { AmortizationData } from "./types"
import { formatCurrency, AMORTIZATION_FIELD_LABELS, AMORTIZATION_FIELDS } from "./utils"

interface AmortizationGridProps {
  data: AmortizationData
  editingCell: string | null
  selectedPeriod: string
  onCellEdit: (period: string, field: string, value: string) => void
  onSetEditingCell: (cellId: string | null) => void
  onSetSelectedPeriod: (period: string) => void
}

/**
 * Amortization grid component
 * Displays loan amortization schedule with inline editing
 */
export function AmortizationGrid({
  data,
  editingCell,
  selectedPeriod,
  onCellEdit,
  onSetEditingCell,
  onSetSelectedPeriod,
}: AmortizationGridProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-gray-900">Amortization Grid</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile View - Stacked with Period Selector */}
        <div className="block sm:hidden">
          <div className="mb-4">
            <Label className="text-xs font-semibold text-gray-600">Select Period</Label>
            <Select value={selectedPeriod} onValueChange={onSetSelectedPeriod}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(data).map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Period Data Display */}
          <div className="space-y-3">
            {Object.entries(data[selectedPeriod] || {}).map(([field, value]) => (
              <div key={field} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{AMORTIZATION_FIELD_LABELS[field]}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${value < 0 ? "text-red-600" : "text-gray-900"}`}>
                    {formatCurrency(value)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onSetEditingCell(`${selectedPeriod}-${field}`)}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View - Full Amortization Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Period
                </th>
                {AMORTIZATION_FIELDS.map((field) => (
                  <th
                    key={field}
                    className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
                  >
                    {AMORTIZATION_FIELD_LABELS[field]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([period, periodData]) => (
                <tr key={period} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 border-r border-gray-100">{period}</td>
                  {AMORTIZATION_FIELDS.map((field) => {
                    const cellId = `${period}-${field}`
                    const value = periodData[field]
                    const isNegative = value < 0
                    const isEditing = editingCell === cellId

                    return (
                      <td
                        key={field}
                        className="py-3 px-4 text-sm text-right border-r border-gray-100 last:border-r-0 relative group"
                      >
                        {isEditing ? (
                          <Input
                            className="h-8 text-sm text-right"
                            defaultValue={value.toString()}
                            onBlur={(e) => {
                              onCellEdit(period, field, e.target.value)
                              onSetEditingCell(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                onCellEdit(period, field, e.currentTarget.value)
                                onSetEditingCell(null)
                              }
                              if (e.key === "Escape") {
                                onSetEditingCell(null)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-medium ${isNegative ? "text-red-600" : "text-gray-900"}`}>
                              {formatCurrency(value)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => onSetEditingCell(cellId)}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Usage Instructions */}
        <div className="mt-4 text-xs text-gray-500">
          <p>• Click the pencil icon to edit any cell</p>
          <p>• Negative balances are highlighted in red</p>
          <p>• Press Enter to save or Escape to cancel</p>
        </div>
      </CardContent>
    </Card>
  )
}
