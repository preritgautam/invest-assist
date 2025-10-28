/**
 * Business Plan Tab Component
 *
 * A comprehensive business plan management interface for real estate investment analysis.
 * This component provides interactive tools for creating, modifying, and analyzing business
 * plans with real-time KPI calculations, scenario management, and plan freezing capabilities.
 *
 * Key Features:
 * - Interactive assumption controls (hold period, renovation budget, financing mix, etc.)
 * - Real-time KPI calculations (IRR, equity multiple, cash-on-cash, DSCR)
 * - AI-driven system suggestions with reasoning
 * - Scenario saving and comparison functionality
 * - Plan freezing for execution readiness
 * - Change log tracking for audit trail
 * - Notes management for documentation
 *
 * @author Real Estate Analysis System
 * @version 1.0.0
 */

"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Briefcase,
  Target,
  TrendingUp,
  DollarSign,
  Info,
  Lock,
  Zap,
  Clock,
  Percent,
  Save,
  BarChart3,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  History,
  Edit3,
  Calculator,
} from "lucide-react"
import { useState } from "react"

/**
 * Property interface representing a real estate investment property
 */
interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

/**
 * Props for the BusinessPlanTab component
 */
interface BusinessPlanTabProps {
  /** The selected property for business plan analysis, null if none selected */
  property: Property | null
}

/**
 * Business plan assumptions interface defining key investment parameters
 */
interface BusinessPlanAssumptions {
  /** Investment hold period in years */
  holdPeriod: number
  /** Renovation budget per unit in dollars */
  renovationBudget: number
  /** Timing strategy for renovations */
  renovationTiming: "upfront" | "staggered" | "opportunistic"
  /** Percentage of equity financing (vs debt) */
  financingMix: number
  /** Exit capitalization rate as percentage */
  exitCap: number
  /** Rent growth assumption level */
  rentGrowth: "conservative" | "base" | "aggressive"
}

/**
 * Key Performance Indicators for investment analysis
 */
interface KPIMetrics {
  /** Internal Rate of Return as percentage */
  irr: number
  /** Equity multiple (total return / initial equity) */
  equityMultiple: number
  /** Cash-on-cash return as percentage */
  cashOnCash: number
  /** Debt Service Coverage Ratio */
  dscr: number
  /** Payback period in years */
  payback: number
}

/**
 * Saved scenario interface for business plan comparison
 */
interface Scenario {
  /** Unique scenario identifier */
  id: string
  /** User-defined scenario name */
  name: string
  /** Business plan assumptions for this scenario */
  assumptions: BusinessPlanAssumptions
  /** Calculated KPI metrics for this scenario */
  metrics: KPIMetrics
  /** Timestamp when scenario was created */
  createdAt: Date
}

/**
 * Change log entry interface for tracking plan modifications
 */
interface ChangeLogEntry {
  /** Unique entry identifier */
  id: string
  /** Type of action performed */
  action: string
  /** Description of the change */
  description: string
  /** Timestamp of the change */
  timestamp: Date
  /** Optional additional data */
  data?: any
  /** Previous value before change */
  oldValue?: any
  /** New value after change */
  newValue?: any
}

/**
 * Business Plan Tab Component
 *
 * Main component for managing real estate investment business plans with interactive
 * controls, real-time calculations, and comprehensive scenario management.
 */
export function PlanTab({ property }: BusinessPlanTabProps) {
  /** Current business plan assumptions */
  const [assumptions, setAssumptions] = useState<BusinessPlanAssumptions>({
    holdPeriod: 5,
    renovationBudget: 10000,
    renovationTiming: "upfront",
    financingMix: 75, // 75% equity, 25% debt
    exitCap: 5.25,
    rentGrowth: "base",
  })

  /** Array of saved scenarios for comparison */
  const [scenarios, setScenarios] = useState<Scenario[]>([])

  /** Currently selected scenarios for comparison (max 3) */
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])

  /** Whether the business plan is frozen for execution */
  const [isPlanFrozen, setIsPlanFrozen] = useState(false)

  /** User notes for the business plan */
  const [notes, setNotes] = useState("")

  /** Change log entries for audit trail */
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([])

  /** Name for new scenario being saved */
  const [newScenarioName, setNewScenarioName] = useState("")

  // Dialog and sheet visibility states
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showComparisonSheet, setShowComparisonSheet] = useState(false)
  const [showFreezeDialog, setShowFreezeDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [showChangeLogSheet, setShowChangeLogSheet] = useState(false)

  /** Frozen plan data when plan is locked */
  const [frozenPlan, setFrozenPlan] = useState<{
    assumptions: BusinessPlanAssumptions
    metrics: KPIMetrics
    frozenAt: Date
  } | null>(null)

  /**
   * Calculate Key Performance Indicators based on business plan assumptions
   *
   * Uses simplified financial modeling to estimate investment returns.
   * In a production system, this would integrate with sophisticated
   * financial modeling engines and market data.
   *
   * @param assumptions - The business plan assumptions to calculate from
   * @returns Calculated KPI metrics
   */
  const calculateKPIs = (assumptions: BusinessPlanAssumptions): KPIMetrics => {
    // Base case metrics - would be derived from market data and property analysis
    const baseIRR = 14.8
    const baseEM = 1.85
    const baseCOC = 7.2
    const baseDSCR = 1.35

    // Adjustment multipliers based on assumptions
    const holdPeriodMultiplier = assumptions.holdPeriod <= 3 ? 0.9 : assumptions.holdPeriod >= 7 ? 1.1 : 1.0
    const renovationMultiplier = assumptions.renovationBudget / 10000 // base is $10k/unit
    const rentGrowthMultiplier =
      assumptions.rentGrowth === "conservative" ? 0.85 : assumptions.rentGrowth === "aggressive" ? 1.15 : 1.0
    const exitCapMultiplier = assumptions.exitCap <= 5.0 ? 1.1 : assumptions.exitCap >= 6.0 ? 0.9 : 1.0

    return {
      irr: baseIRR * holdPeriodMultiplier * renovationMultiplier * rentGrowthMultiplier * exitCapMultiplier,
      equityMultiple: baseEM * holdPeriodMultiplier * exitCapMultiplier,
      cashOnCash: baseCOC * rentGrowthMultiplier,
      dscr: baseDSCR * (assumptions.financingMix / 75), // Higher equity = better DSCR
      payback: assumptions.holdPeriod * 0.8, // Simplified payback calculation
    }
  }

  /** Current KPI metrics based on current assumptions */
  const currentMetrics = calculateKPIs(assumptions)

  /**
   * AI-generated system suggestion for optimal business plan
   *
   * In production, this would be generated by machine learning models
   * analyzing market conditions, comparable properties, and risk factors.
   */
  const systemSuggestion = {
    holdPeriod: 5,
    renovationBudget: 10000,
    exitCap: 5.25,
    rentGrowth: "2.5% Annual Growth" as const,
    projectedReturns: {
      irr: 16.2,
      equityMultiple: 1.85,
      cashOnCash: 7.0,
      dscr: 1.35,
    },
    reasoning: {
      holdPeriod: "Optimal hold period based on market cycle analysis",
      renovationBudget: "Comparable properties show $10k/unit generates 15-20% rent premiums",
      exitCap: "Market cap rates trending down, conservative exit assumption",
      rentGrowth: "Local market fundamentals support 2.5% annual growth with strong job growth and limited supply",
    },
  }

  /**
   * Add an entry to the change log for audit trail
   *
   * @param action - Type of action performed
   * @param description - Description of the change
   * @param oldValue - Previous value (optional)
   * @param newValue - New value (optional)
   */
  const addToChangeLog = (action: string, description: string, oldValue?: any, newValue?: any) => {
    const entry: ChangeLogEntry = {
      id: Date.now().toString(),
      action,
      description,
      timestamp: new Date(),
      oldValue,
      newValue,
    }
    setChangeLog((prev) => [entry, ...prev])
  }

  /**
   * Update a specific assumption and log the change
   *
   * @param key - The assumption key to update
   * @param value - The new value
   */
  const updateAssumptions = (key: keyof BusinessPlanAssumptions, value: any) => {
    const oldValue = assumptions[key]
    setAssumptions((prev) => ({ ...prev, [key]: value }))

    if (oldValue !== value) {
      addToChangeLog("Assumption Updated", `${key.charAt(0).toUpperCase() + key.slice(1)} changed`, oldValue, value)
    }
  }

  /**
   * Save the current assumptions and metrics as a named scenario
   */
  const saveScenario = () => {
    if (!newScenarioName.trim()) return

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: newScenarioName,
      assumptions: { ...assumptions },
      metrics: calculateKPIs(assumptions),
      createdAt: new Date(),
    }

    setScenarios((prev) => [...prev, newScenario])
    setNewScenarioName("")
    setShowSaveDialog(false)

    addToChangeLog("Scenario Saved", `Created new scenario: ${newScenarioName}`)
  }

  /**
   * Delete a saved scenario
   *
   * @param scenarioId - ID of the scenario to delete
   */
  const deleteScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId))
    setSelectedScenarios((prev) => prev.filter((id) => id !== scenarioId))

    if (scenario) {
      addToChangeLog("Scenario Deleted", `Removed scenario: ${scenario.name}`)
    }
  }

  /**
   * Toggle scenario selection for comparison (max 3 scenarios)
   *
   * @param scenarioId - ID of the scenario to toggle
   */
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

  /**
   * Freeze the current business plan for execution
   *
   * Creates a locked snapshot of the current plan that cannot be modified
   * without explicit unfreezing. Used when plan is ready for implementation.
   */
  const freezePlan = () => {
    const frozenData = {
      assumptions: { ...assumptions },
      metrics: calculateKPIs(assumptions),
      frozenAt: new Date(),
    }

    setFrozenPlan(frozenData)
    setIsPlanFrozen(true)
    setShowFreezeDialog(false)

    addToChangeLog("Plan Frozen", "Business plan finalized and locked for execution", null, frozenData)
  }

  /**
   * Unfreeze the business plan to allow modifications
   */
  const unfreezePlan = () => {
    setIsPlanFrozen(false)
    setFrozenPlan(null)

    addToChangeLog("Plan Unfrozen", "Business plan unlocked for further modifications")
  }

  /**
   * Save business plan notes and log the change
   */
  const saveNotes = () => {
    addToChangeLog("Notes Updated", "Business plan notes were modified")
    setShowNotesDialog(false)
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">Business Plan</h2>
        <p className="text-sm text-gray-600">Select a property to view business plan details.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Header Card with Action Buttons */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Business Plan Suggestions</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  AI-driven plan for maximizing returns. Adjust assumptions to refine strategy.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Plan Status Badge */}
              {isPlanFrozen && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Finalized
                </Badge>
              )}

              {/* Notes Dialog */}
              <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Business Plan Notes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">
                        Add notes, assumptions, or key considerations for this business plan:
                      </Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter your notes here..."
                        className="min-h-[200px] mt-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveNotes}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Change Log Sheet */}
              <Sheet open={showChangeLogSheet} onOpenChange={setShowChangeLogSheet}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-2xl">
                  <SheetHeader>
                    <SheetTitle>Change Log</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {changeLog.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No changes recorded yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Changes will appear here as you modify the business plan
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {changeLog.map((entry) => (
                          <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    entry.action === "Plan Frozen"
                                      ? "bg-gray-600"
                                      : entry.action === "Plan Unfrozen"
                                        ? "bg-gray-500"
                                        : entry.action === "Scenario Saved"
                                          ? "bg-gray-700"
                                          : entry.action === "Scenario Deleted"
                                            ? "bg-gray-400"
                                            : "bg-gray-500"
                                  }`}
                                />
                                <span className="text-sm font-semibold text-gray-900">{entry.action}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{entry.description}</p>

                            {/* Show before/after values for changes */}
                            {entry.oldValue !== undefined && entry.newValue !== undefined && (
                              <div className="bg-gray-50 rounded p-2 text-xs">
                                <div className="flex gap-4">
                                  <div>
                                    <span className="text-gray-600 font-medium">From:</span>
                                    <span className="ml-1">
                                      {typeof entry.oldValue === "object"
                                        ? JSON.stringify(entry.oldValue)
                                        : String(entry.oldValue)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-medium">To:</span>
                                    <span className="ml-1">
                                      {typeof entry.newValue === "object"
                                        ? JSON.stringify(entry.newValue)
                                        : String(entry.newValue)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Business Plan Notes Display */}
      {notes && (
        <Card className="bg-gray-50 rounded-2xl shadow-lg border-2 border-gray-200">
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">Business Plan Notes</CardTitle>
                  <p className="text-xs text-gray-700">Key considerations and assumptions</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNotesDialog(true)}
                className="text-gray-600 hover:bg-gray-100"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frozen Plan Display */}
      {isPlanFrozen && frozenPlan && (
        <Card className="bg-gray-50 rounded-2xl shadow-lg border-2 border-gray-200">
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">Frozen Business Plan</CardTitle>
                  <p className="text-xs text-gray-700">
                    Plan finalized on {frozenPlan.frozenAt.toLocaleDateString()} at{" "}
                    {frozenPlan.frozenAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge className="bg-gray-600 text-white text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Execution Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {/* Frozen Plan KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-base font-bold text-gray-800">{frozenPlan.metrics.irr.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Target IRR</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-base font-bold text-gray-800">{frozenPlan.metrics.equityMultiple.toFixed(2)}x</div>
                <div className="text-xs text-gray-600">Equity Multiple</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-base font-bold text-gray-800">{frozenPlan.metrics.cashOnCash.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Cash-on-Cash</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-base font-bold text-gray-800">{frozenPlan.assumptions.holdPeriod} years</div>
                <div className="text-xs text-gray-600">Hold Period</div>
              </div>
            </div>

            {/* Execution Parameters */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Execution Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Renovation Budget:</span>
                  <span className="font-medium ml-2">
                    ${frozenPlan.assumptions.renovationBudget.toLocaleString()}/unit
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Renovation Timing:</span>
                  <span className="font-medium ml-2 capitalize">{frozenPlan.assumptions.renovationTiming}</span>
                </div>
                <div>
                  <span className="text-gray-600">Financing Mix:</span>
                  <span className="font-medium ml-2">{frozenPlan.assumptions.financingMix}% equity</span>
                </div>
                <div>
                  <span className="text-gray-600">Exit Cap Rate:</span>
                  <span className="font-medium ml-2">{frozenPlan.assumptions.exitCap.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Rent Growth:</span>
                  <span className="font-medium ml-2 capitalize">{frozenPlan.assumptions.rentGrowth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI System Suggestions Card */}
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
          {/* System Suggestion Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Hold Period */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">Hold Period</span>
                </div>
                <Info className="w-3 h-3 text-gray-400 cursor-help" title={systemSuggestion.reasoning.holdPeriod} />
              </div>
              <div className="text-base font-bold text-gray-900">{systemSuggestion.holdPeriod} years</div>
            </div>

            {/* Renovation Budget */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">Renovation Budget</span>
                </div>
                <Info
                  className="w-3 h-3 text-gray-400 cursor-help"
                  title={systemSuggestion.reasoning.renovationBudget}
                />
              </div>
              <div className="text-base font-bold text-gray-900">
                ${systemSuggestion.renovationBudget.toLocaleString()}/unit
              </div>
            </div>

            {/* Exit Cap Rate */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">Exit Cap Rate</span>
                </div>
                <Info className="w-3 h-3 text-gray-400 cursor-help" title={systemSuggestion.reasoning.exitCap} />
              </div>
              <div className="text-base font-bold text-gray-900">{systemSuggestion.exitCap}%</div>
            </div>

            {/* Rent Growth */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">Rent Growth</span>
                </div>
                <Info className="w-3 h-3 text-gray-400 cursor-help" title={systemSuggestion.reasoning.rentGrowth} />
              </div>
              <div className="text-base font-bold text-gray-900">{systemSuggestion.rentGrowth}</div>
            </div>
          </div>

          {/* Projected Returns */}
          <div className="border-t pt-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Projected Returns</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{systemSuggestion.projectedReturns.irr}%</div>
                <div className="text-xs text-gray-600">IRR</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {systemSuggestion.projectedReturns.equityMultiple}x
                </div>
                <div className="text-xs text-gray-600">Equity Multiple</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{systemSuggestion.projectedReturns.cashOnCash}%</div>
                <div className="text-xs text-gray-600">Cash-on-Cash</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{systemSuggestion.projectedReturns.dscr}x</div>
                <div className="text-xs text-gray-600">DSCR</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Interactive Plan Controls */}
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
                  onValueChange={(value) => {
                    updateAssumptions("holdPeriod", value[0])
                  }}
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
                    ${assumptions.renovationBudget.toLocaleString()}/unit
                  </span>
                </div>
                <Slider
                  value={[assumptions.renovationBudget]}
                  onValueChange={(value) => {
                    updateAssumptions("renovationBudget", value[0])
                  }}
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
                    updateAssumptions("renovationTiming", value)
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
                  onValueChange={(value) => {
                    updateAssumptions("financingMix", value[0])
                  }}
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
                  onValueChange={(value) => {
                    updateAssumptions("exitCap", value[0])
                  }}
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
                    updateAssumptions("rentGrowth", value)
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

        {/* Real-time KPIs Display */}
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
              {/* Save Scenario Dialog */}
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
                      <Button onClick={saveScenario} disabled={!newScenarioName.trim()}>
                        Save Scenario
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* IRR */}
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

              {/* Equity Multiple */}
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
                  {Math.abs(currentMetrics.equityMultiple - systemSuggestion.projectedReturns.equityMultiple).toFixed(
                    2,
                  )}
                  x
                </p>
              </div>

              {/* Cash-on-Cash */}
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

              {/* DSCR */}
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

              {/* Payback Period */}
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
      </div>

      {/* Saved Scenarios section */}
      {scenarios.length > 0 && (
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
                      {/* Comparison Table */}
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
                                    ${scenario?.assumptions.renovationBudget.toLocaleString()}/unit
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
                          setAssumptions(scenario.assumptions)
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
                          deleteScenario(scenario.id)
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
                      <span className="font-medium">
                        ${scenario.assumptions.renovationBudget.toLocaleString()}/unit
                      </span>
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
      )}

      {/* Freeze/Unfreeze Plan Button */}
      <div className="flex justify-center pt-4">
        {isPlanFrozen ? (
          <Button
            size="lg"
            variant="outline"
            onClick={unfreezePlan}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
          >
            <Lock className="w-4 h-4 mr-2" />
            Unfreeze Plan
          </Button>
        ) : (
          <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gray-600 hover:bg-gray-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Freeze Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Freeze Business Plan
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Warning:</strong> Freezing this plan will:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1 ml-4">
                    <li>• Lock all current assumptions and projections</li>
                    <li>• Disable editing of controls</li>
                    <li>• Create a permanent record for execution</li>
                    <li>• Require manual unfreezing to make changes</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Plan Summary:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-700">Hold Period:</span>
                      <span className="font-medium ml-2">{assumptions.holdPeriod} years</span>
                    </div>
                    <div>
                      <span className="text-gray-700">Renovation:</span>
                      <span className="font-medium ml-2">${assumptions.renovationBudget.toLocaleString()}/unit</span>
                    </div>
                    <div>
                      <span className="text-gray-700">IRR:</span>
                      <span className="font-bold text-gray-800 ml-2">{currentMetrics.irr.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-700">Equity Multiple:</span>
                      <span className="font-bold text-gray-800 ml-2">{currentMetrics.equityMultiple.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowFreezeDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={freezePlan} className="bg-gray-600 hover:bg-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Freeze
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
