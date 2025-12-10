/**
 * Interactive Plan Controls Component
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Target, Lock } from "lucide-react"
import type { BusinessPlanAssumptions } from "./types"

interface InteractiveControlsProps {
  assumptions: BusinessPlanAssumptions
  isPlanFrozen: boolean
  onUpdateAssumptions: (key: keyof BusinessPlanAssumptions, value: any) => void
}

export function InteractiveControls({ assumptions, isPlanFrozen, onUpdateAssumptions }: InteractiveControlsProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Target className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">Interactive Plan</CardTitle>
              <p className="text-xs text-gray-600">
                {isPlanFrozen
                  ? "Plan is frozen - unfreeze to make changes"
                  : "Adjust assumptions to see real-time impact"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        <div className={`space-y-4 ${isPlanFrozen ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Hold Period Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700">Hold Period</Label>
              <span className="text-xs font-bold text-gray-900">{assumptions.holdPeriod} years</span>
            </div>
            <Slider
              value={[assumptions.holdPeriod]}
              onValueChange={(value) => onUpdateAssumptions("holdPeriod", value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
              disabled={isPlanFrozen}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 year</span>
              <span>10 years</span>
            </div>
          </div>

          {/* Renovation Budget Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700">Renovation Budget</Label>
              <span className="text-xs font-bold text-gray-900">
                ${assumptions.renovationBudget.toLocaleString('en-US')}/unit
              </span>
            </div>
            <Slider
              value={[assumptions.renovationBudget]}
              onValueChange={(value) => onUpdateAssumptions("renovationBudget", value[0])}
              min={0}
              max={15000}
              step={500}
              className="w-full"
              disabled={isPlanFrozen}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span>$15,000</span>
            </div>
          </div>

          {/* Renovation Timing Select */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Renovation Timing</Label>
            <Select
              value={assumptions.renovationTiming}
              onValueChange={(value: "upfront" | "staggered" | "opportunistic") =>
                onUpdateAssumptions("renovationTiming", value)
              }
              disabled={isPlanFrozen}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upfront">Upfront</SelectItem>
                <SelectItem value="staggered">Staggered</SelectItem>
                <SelectItem value="opportunistic">Opportunistic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Financing Mix Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700">Financing Mix</Label>
              <span className="text-xs font-bold text-gray-900">
                {assumptions.financingMix}% equity / {100 - assumptions.financingMix}% debt
              </span>
            </div>
            <Slider
              value={[assumptions.financingMix]}
              onValueChange={(value) => onUpdateAssumptions("financingMix", value[0])}
              min={20}
              max={100}
              step={5}
              className="w-full"
              disabled={isPlanFrozen}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>20% equity</span>
              <span>100% equity</span>
            </div>
          </div>

          {/* Exit Cap Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700">Exit Cap Rate</Label>
              <span className="text-xs font-bold text-gray-900">{assumptions.exitCap.toFixed(2)}%</span>
            </div>
            <Slider
              value={[assumptions.exitCap]}
              onValueChange={(value) => onUpdateAssumptions("exitCap", value[0])}
              min={4.0}
              max={7.0}
              step={0.25}
              className="w-full"
              disabled={isPlanFrozen}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>4.0%</span>
              <span>7.0%</span>
            </div>
          </div>

          {/* Rent Growth Select */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Rent Growth</Label>
            <Select
              value={assumptions.rentGrowth}
              onValueChange={(value: "conservative" | "base" | "aggressive") =>
                onUpdateAssumptions("rentGrowth", value)
              }
              disabled={isPlanFrozen}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative (1.5% YoY)</SelectItem>
                <SelectItem value="base">Base (2.5% YoY)</SelectItem>
                <SelectItem value="aggressive">Aggressive (3.5% YoY)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Frozen Plan Message */}
        {isPlanFrozen && (
          <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Lock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-600">Plan is Frozen</p>
              <p className="text-xs text-gray-500">Unfreeze the plan to make adjustments</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
