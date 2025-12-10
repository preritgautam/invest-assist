/**
 * Saved Scenarios Section Component
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { BarChart3, Copy, Trash2 } from "lucide-react"
import type { Scenario, BusinessPlanAssumptions } from "./types"
import { useState } from "react"

interface ScenariosSectionProps {
  scenarios: Scenario[]
  onDeleteScenario: (id: string) => void
  onLoadScenario: (assumptions: BusinessPlanAssumptions) => void
}

export function ScenariosSection({ scenarios, onDeleteScenario, onLoadScenario }: ScenariosSectionProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [showComparisonSheet, setShowComparisonSheet] = useState(false)

  const toggleScenarioSelection = (scenarioId: string) => {
    setSelectedScenarios((prev) => {
      if (prev.includes(scenarioId)) {
        return prev.filter((id) => id !== scenarioId)
      } else if (prev.length < 3) {
        return [...prev, scenarioId]
      }
      return prev
    })
  }

  if (scenarios.length === 0) return null

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">Saved Scenarios</CardTitle>
              <p className="text-xs text-gray-600">Compare different business plan assumptions</p>
            </div>
          </div>
          {selectedScenarios.length >= 2 && (
            <Sheet open={showComparisonSheet} onOpenChange={setShowComparisonSheet}>
              <SheetTrigger asChild>
                <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare ({selectedScenarios.length})
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-4xl">
                <SheetHeader>
                  <SheetTitle>Scenario Comparison</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-semibold text-gray-900">Metric</th>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <th key={scenarioId} className="text-center p-3 text-sm font-semibold text-gray-900">
                                {scenario?.name}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 text-sm font-medium text-gray-700">IRR</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm font-bold text-gray-800">
                                {scenario?.metrics.irr.toFixed(1)}%
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 text-sm font-medium text-gray-700">Equity Multiple</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm font-bold text-gray-800">
                                {scenario?.metrics.equityMultiple.toFixed(2)}x
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 text-sm font-medium text-gray-700">Cash-on-Cash</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm font-bold text-gray-800">
                                {scenario?.metrics.cashOnCash.toFixed(1)}%
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="p-3 text-sm font-medium text-gray-700">DSCR</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm font-bold text-gray-800">
                                {scenario?.metrics.dscr.toFixed(2)}x
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-sm font-medium text-gray-700">Hold Period</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm text-gray-900">
                                {scenario?.assumptions.holdPeriod} years
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-sm font-medium text-gray-700">Renovation Budget</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm text-gray-900">
                                ${scenario?.assumptions.renovationBudget.toLocaleString('en-US')}/unit
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-sm font-medium text-gray-700">Exit Cap Rate</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm text-gray-900">
                                {scenario?.assumptions.exitCap.toFixed(2)}%
                              </td>
                            )
                          })}
                        </tr>
                        <tr>
                          <td className="p-3 text-sm font-medium text-gray-700">Rent Growth</td>
                          {selectedScenarios.map((scenarioId) => {
                            const scenario = scenarios.find((s) => s.id === scenarioId)
                            return (
                              <td key={scenarioId} className="text-center p-3 text-sm text-gray-900 capitalize">
                                {scenario?.assumptions.rentGrowth}
                              </td>
                            )
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`flex-shrink-0 w-60 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedScenarios.includes(scenario.id)
                  ? "border-gray-500 bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => toggleScenarioSelection(scenario.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">{scenario.name}</h4>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLoadScenario(scenario.assumptions)
                    }}
                    className="p-1 h-5 w-5"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteScenario(scenario.id)
                    }}
                    className="p-1 h-5 w-5 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hold Period:</span>
                  <span className="font-medium">{scenario.assumptions.holdPeriod} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Renovation:</span>
                  <span className="font-medium">${scenario.assumptions.renovationBudget.toLocaleString('en-US')}/unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IRR:</span>
                  <span className="font-bold text-gray-800">{scenario.metrics.irr.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Equity Multiple:</span>
                  <span className="font-bold text-gray-800">{scenario.metrics.equityMultiple.toFixed(2)}x</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">Created {scenario.createdAt.toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedScenarios.length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-700">
              {selectedScenarios.length} scenario{selectedScenarios.length > 1 ? "s" : ""} selected for comparison.
              {selectedScenarios.length >= 2
                ? " Click Compare to view side-by-side analysis."
                : " Select at least 2 scenarios to compare."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
