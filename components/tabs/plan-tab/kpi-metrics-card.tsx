/**
 * KPI Metrics Display Card Component
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, DollarSign, Percent, Clock, Calculator, Save } from "lucide-react"
import type { KPIMetrics, SystemSuggestion } from "./types"
import { useState } from "react"

interface KPIMetricsCardProps {
  currentMetrics: KPIMetrics
  systemSuggestion: SystemSuggestion
  isPlanFrozen: boolean
  onSaveScenario: (name: string) => void
}

export function KPIMetricsCard({
  currentMetrics,
  systemSuggestion,
  isPlanFrozen,
  onSaveScenario,
}: KPIMetricsCardProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newScenarioName, setNewScenarioName] = useState("")

  const handleSave = () => {
    if (newScenarioName.trim()) {
      onSaveScenario(newScenarioName)
      setNewScenarioName("")
      setShowSaveDialog(false)
    }
  }

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">Real-time KPIs</CardTitle>
              <p className="text-xs text-gray-600">
                {isPlanFrozen ? "Frozen plan metrics" : "Updated based on your assumptions"}
              </p>
            </div>
          </div>
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white" disabled={isPlanFrozen}>
                <Save className="w-4 h-4 mr-2" />
                Save Scenario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current Scenario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input
                    id="scenario-name"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    placeholder="e.g., Base Case, Aggressive, Conservative"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!newScenarioName.trim()}>
                    Save Scenario
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="p-1 bg-gray-100 rounded-lg w-fit mx-auto mb-1">
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-gray-600">IRR</p>
            <p className="text-base font-bold text-gray-900">{currentMetrics.irr.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">
              {currentMetrics.irr > systemSuggestion.projectedReturns.irr
                ? "↗"
                : currentMetrics.irr < systemSuggestion.projectedReturns.irr
                  ? "↘"
                  : "→"}{" "}
              {Math.abs(currentMetrics.irr - systemSuggestion.projectedReturns.irr).toFixed(1)}%
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="p-1 bg-gray-100 rounded-lg w-fit mx-auto mb-1">
              <DollarSign className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-gray-600">Equity Multiple</p>
            <p className="text-base font-bold text-gray-900">{currentMetrics.equityMultiple.toFixed(2)}x</p>
            <p className="text-xs text-gray-500">
              {currentMetrics.equityMultiple > systemSuggestion.projectedReturns.equityMultiple
                ? "↗"
                : currentMetrics.equityMultiple < systemSuggestion.projectedReturns.equityMultiple
                  ? "↘"
                  : "→"}{" "}
              {Math.abs(currentMetrics.equityMultiple - systemSuggestion.projectedReturns.equityMultiple).toFixed(2)}x
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="p-1 bg-gray-100 rounded-lg w-fit mx-auto mb-1">
              <Percent className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-gray-600">Cash-on-Cash</p>
            <p className="text-base font-bold text-gray-900">{currentMetrics.cashOnCash.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">
              {currentMetrics.cashOnCash > systemSuggestion.projectedReturns.cashOnCash
                ? "↗"
                : currentMetrics.cashOnCash < systemSuggestion.projectedReturns.cashOnCash
                  ? "↘"
                  : "→"}{" "}
              {Math.abs(currentMetrics.cashOnCash - systemSuggestion.projectedReturns.cashOnCash).toFixed(1)}%
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="p-1 bg-gray-100 rounded-lg w-fit mx-auto mb-1">
              <Calculator className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-gray-600">DSCR</p>
            <p className="text-base font-bold text-gray-900">{currentMetrics.dscr.toFixed(2)}x</p>
            <p className="text-xs text-gray-500">
              {currentMetrics.dscr > systemSuggestion.projectedReturns.dscr
                ? "↗"
                : currentMetrics.dscr < systemSuggestion.projectedReturns.dscr
                  ? "↘"
                  : "→"}{" "}
              {Math.abs(currentMetrics.dscr - systemSuggestion.projectedReturns.dscr).toFixed(2)}x
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 text-center col-span-2">
            <div className="p-1 bg-gray-100 rounded-lg w-fit mx-auto mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-gray-600">Payback Period</p>
            <p className="text-base font-bold text-gray-900">{currentMetrics.payback.toFixed(1)} years</p>
            <p className="text-xs text-gray-500">Based on cash flow</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
