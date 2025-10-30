/**
 * Enhanced Pro Forma Tab - Seller OS vs Your Underwriting Comparison
 *
 * This component displays comprehensive pro forma financial analysis for properties,
 * allowing for a side-by-side comparison between the Seller's Operating Statement (OS)
 * and your Underwritten projections. It provides insights into variances, growth assumptions,
 * and projected future performance.
 */

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { PropertyData } from "@/lib/property-data"
import type { CategoryData, InputMode } from "./pro-forma-tab/types"
import { initializeProFormaData } from "./pro-forma-tab/mock-data"
import { HeaderControls } from "./pro-forma-tab/header-controls"
import { TableHeader } from "./pro-forma-tab/table-header"
import { CategoryHeader } from "./pro-forma-tab/category-header"
import { LineItemRow } from "./pro-forma-tab/line-item-row"
import { TipsCard } from "./pro-forma-tab/tips-card"

interface ProFormaTabProps {
  property: PropertyData | null
}

export function ProFormaTab({ property }: ProFormaTabProps) {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [globalInputMode, setGlobalInputMode] = useState<InputMode>("total")
  const [holdPeriod, setHoldPeriod] = useState(5)
  const [showProjections, setShowProjections] = useState(true)
  const [editingCell, setEditingCell] = useState<{ itemId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [expandedT12, setExpandedT12] = useState<Set<string>>(new Set())

  const units = property?.units || 100

  useEffect(() => {
    if (property) {
      const data = initializeProFormaData(property)
      setCategories(data)
    }
  }, [property])

  const toggleCategory = (categoryId: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat)))
  }

  const toggleT12 = (itemId: string) => {
    setExpandedT12((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleCellEdit = (itemId: string, field: string, value: string) => {
    setEditingCell({ itemId, field })
    setEditValue(value)
  }

  const handleCellSave = () => {
    if (!editingCell) return

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === editingCell.itemId ? { ...item, [editingCell.field]: Number.parseFloat(editValue) || 0 } : item,
        ),
      })),
    )

    setEditingCell(null)
    setEditValue("")
  }

  if (!property) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-600">Select a property to view pro forma analysis.</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header Card with Controls */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Pro Forma Analysis</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Compare In-Place Financials vs Your Underwriting</p>
              </div>
              <HeaderControls
                globalInputMode={globalInputMode}
                setGlobalInputMode={setGlobalInputMode}
                showProjections={showProjections}
                setShowProjections={setShowProjections}
              />
            </div>
          </CardHeader>
        </Card>

        {/* Pro Forma Table */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <TableHeader showProjections={showProjections} holdPeriod={holdPeriod} />

                <tbody>
                  {categories.map((category) => (
                    <React.Fragment key={category.id}>
                      <CategoryHeader
                        categoryId={category.id}
                        title={category.title}
                        color={category.color}
                        expanded={category.expanded}
                        onToggle={toggleCategory}
                        showProjections={showProjections}
                        holdPeriod={holdPeriod}
                      />

                      {category.expanded &&
                        category.items.map((item) => (
                          <LineItemRow
                            key={item.id}
                            item={item}
                            categoryId={category.id}
                            globalInputMode={globalInputMode}
                            units={units}
                            showProjections={showProjections}
                            holdPeriod={holdPeriod}
                            isT12Expanded={expandedT12.has(item.id)}
                            editingCell={editingCell}
                            editValue={editValue}
                            onToggleT12={toggleT12}
                            onCellEdit={handleCellEdit}
                            onCellSave={handleCellSave}
                            setEditValue={setEditValue}
                          />
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <TipsCard />
      </div>
    </TooltipProvider>
  )
}
