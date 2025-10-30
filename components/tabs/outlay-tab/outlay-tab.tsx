/**
 * Sources & Uses of Funds Tab Component
 *
 * A comprehensive financial analysis interface for tracking sources and uses of capital
 * in real estate investment transactions. Provides detailed breakdown of funding sources
 * and capital deployment at closing and throughout the hold period.
 *
 * @module OutlayTab
 */

"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeftRight, Building, PieChart, TrendingUp, Calculator } from "lucide-react"
import type { SourcesUsesTabProps, LineItem } from "./types"
import { useState } from "react"
import { SummaryMetrics } from "./summary-metrics"
import { SourcesUsesTable } from "./sources-uses-table"
import { initialSourcesAtClosing, initialUsesAtClosing, initialSourcesOverHold, initialUsesOverHold } from "./mock-data"

export function OutlayTab({ property }: SourcesUsesTabProps) {
  const [sourcesAtClosing, setSourcesAtClosing] = useState<LineItem[]>(initialSourcesAtClosing)
  const [usesAtClosing, setUsesAtClosing] = useState<LineItem[]>(initialUsesAtClosing)
  const [sourcesOverHold, setSourcesOverHold] = useState<LineItem[]>(initialSourcesOverHold)
  const [usesOverHold, setUsesOverHold] = useState<LineItem[]>(initialUsesOverHold)
  const [notes, setNotes] = useState("")

  const updateLineItem = (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value, isEdited: true } : item)))
  }

  // Calculate totals
  const totalSourcesAtClosing = sourcesAtClosing.reduce((sum, item) => sum + item.amount, 0)
  const totalUsesAtClosing = usesAtClosing.reduce((sum, item) => sum + item.amount, 0)
  const totalSourcesOverHold = sourcesOverHold.reduce((sum, item) => sum + item.amount, 0)
  const totalUsesOverHold = usesOverHold.reduce((sum, item) => sum + item.amount, 0)

  const totalSources = totalSourcesAtClosing + totalSourcesOverHold
  const totalUses = totalUsesAtClosing + totalUsesOverHold
  const netDebtFinancing = sourcesAtClosing.find((s) => s.item.includes("Sr. Debt"))?.amount || 0
  const equityContribution = sourcesAtClosing.find((s) => s.item.includes("Equity"))?.amount || 0
  const cashFlowFunded = sourcesOverHold.find((s) => s.item.includes("Cash Flow"))?.amount || 0

  if (!property) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-4 sm:p-6 lg:p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-4">Sources & Uses</h2>
        <p className="text-xs sm:text-sm text-gray-600">Select a property to view sources and uses breakdown.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">Sources & Uses of Funds</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Funding breakdown and deployment of capital at closing and during the hold period.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Metrics Cards */}
      <SummaryMetrics
        totalSources={totalSources}
        totalUses={totalUses}
        netDebtFinancing={netDebtFinancing}
        equityContribution={equityContribution}
        cashFlowFunded={cashFlowFunded}
      />

      {/* Sources and Uses Tables - At Closing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourcesUsesTable
          title="Sources At Closing"
          icon={
            <div className="p-2 bg-green-100 rounded-lg">
              <PieChart className="w-5 h-5 text-green-600" />
            </div>
          }
          items={sourcesAtClosing}
          onUpdateItem={(id, field, value) => updateLineItem(sourcesAtClosing, setSourcesAtClosing, id, field, value)}
        />

        <SourcesUsesTable
          title="Uses At Closing"
          icon={
            <div className="p-2 bg-red-100 rounded-lg">
              <PieChart className="w-5 h-5 text-red-600" />
            </div>
          }
          items={usesAtClosing}
          showPerUnit
          onUpdateItem={(id, field, value) => updateLineItem(usesAtClosing, setUsesAtClosing, id, field, value)}
        />
      </div>

      {/* Sources and Uses Over Hold Period */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourcesUsesTable
          title="Sources Over Hold Period"
          icon={
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          }
          items={sourcesOverHold}
          onUpdateItem={(id, field, value) => updateLineItem(sourcesOverHold, setSourcesOverHold, id, field, value)}
        />

        <SourcesUsesTable
          title="Uses Over Hold Period"
          icon={
            <div className="p-2 bg-red-100 rounded-lg">
              <Calculator className="w-5 h-5 text-red-600" />
            </div>
          }
          items={usesOverHold}
          showPerUnit
          onUpdateItem={(id, field, value) => updateLineItem(usesOverHold, setUsesOverHold, id, field, value)}
        />
      </div>

      {/* Analyst Notes Section */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-gray-900">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add analyst comments and notes about the sources and uses assumptions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24"
          />
        </CardContent>
      </Card>
    </div>
  )
}
