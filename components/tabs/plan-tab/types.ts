/**
 * Type definitions for Business Plan Tab
 */

export interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

export interface BusinessPlanTabProps {
  property: Property | null
}

export interface BusinessPlanAssumptions {
  holdPeriod: number
  renovationBudget: number
  renovationTiming: "upfront" | "staggered" | "opportunistic"
  financingMix: number
  exitCap: number
  rentGrowth: "conservative" | "base" | "aggressive"
}

export interface KPIMetrics {
  irr: number
  equityMultiple: number
  cashOnCash: number
  dscr: number
  payback: number
}

export interface Scenario {
  id: string
  name: string
  assumptions: BusinessPlanAssumptions
  metrics: KPIMetrics
  createdAt: Date
}

export interface ChangeLogEntry {
  id: string
  action: string
  description: string
  timestamp: Date
  data?: any
  oldValue?: any
  newValue?: any
}

export interface SystemSuggestion {
  holdPeriod: number
  renovationBudget: number
  exitCap: number
  rentGrowth: string
  projectedReturns: {
    irr: number
    equityMultiple: number
    cashOnCash: number
    dscr: number
  }
  reasoning: {
    holdPeriod: string
    renovationBudget: string
    exitCap: string
    rentGrowth: string
  }
}

export interface FrozenPlan {
  assumptions: BusinessPlanAssumptions
  metrics: KPIMetrics
  frozenAt: Date
}
