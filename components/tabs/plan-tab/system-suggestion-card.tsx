/**
 * System Suggestion Card Component
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, DollarSign, Percent, TrendingUp, Info } from "lucide-react"
import type { SystemSuggestion } from "./types"

interface SystemSuggestionCardProps {
  suggestion: SystemSuggestion
}

export function SystemSuggestionCard({ suggestion }: SystemSuggestionCardProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Zap className="w-5 h-5 text-gray-600" />
            </div>
            <CardTitle className="text-sm font-bold text-gray-900">Suggested Plan</CardTitle>
          </div>
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Suggested by System
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">Hold Period</span>
              </div>
              <Info className="w-3 h-3 text-gray-400 cursor-help" title={suggestion.reasoning.holdPeriod} />
            </div>
            <div className="text-base font-bold text-gray-900">{suggestion.holdPeriod} years</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">Renovation Budget</span>
              </div>
              <Info className="w-3 h-3 text-gray-400 cursor-help" title={suggestion.reasoning.renovationBudget} />
            </div>
            <div className="text-base font-bold text-gray-900">
              ${suggestion.renovationBudget.toLocaleString('en-US')}/unit
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">Exit Cap Rate</span>
              </div>
              <Info className="w-3 h-3 text-gray-400 cursor-help" title={suggestion.reasoning.exitCap} />
            </div>
            <div className="text-base font-bold text-gray-900">{suggestion.exitCap}%</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">Rent Growth</span>
              </div>
              <Info className="w-3 h-3 text-gray-400 cursor-help" title={suggestion.reasoning.rentGrowth} />
            </div>
            <div className="text-base font-bold text-gray-900">{suggestion.rentGrowth}</div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Projected Returns</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{suggestion.projectedReturns.irr}%</div>
              <div className="text-xs text-gray-600">IRR</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{suggestion.projectedReturns.equityMultiple}x</div>
              <div className="text-xs text-gray-600">Equity Multiple</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{suggestion.projectedReturns.cashOnCash}%</div>
              <div className="text-xs text-gray-600">Cash-on-Cash</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{suggestion.projectedReturns.dscr}x</div>
              <div className="text-xs text-gray-600">DSCR</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
