/**
 * Utility functions for Business Plan calculations
 */

import type { BusinessPlanAssumptions, KPIMetrics } from "./types"

/**
 * Calculate Key Performance Indicators based on business plan assumptions
 */
export const calculateKPIs = (assumptions: BusinessPlanAssumptions): KPIMetrics => {
  const baseIRR = 14.8
  const baseEM = 1.85
  const baseCOC = 7.2
  const baseDSCR = 1.35

  const holdPeriodMultiplier = assumptions.holdPeriod <= 3 ? 0.9 : assumptions.holdPeriod >= 7 ? 1.1 : 1.0
  const renovationMultiplier = assumptions.renovationBudget / 10000
  const rentGrowthMultiplier =
    assumptions.rentGrowth === "conservative" ? 0.85 : assumptions.rentGrowth === "aggressive" ? 1.15 : 1.0
  const exitCapMultiplier = assumptions.exitCap <= 5.0 ? 1.1 : assumptions.exitCap >= 6.0 ? 0.9 : 1.0

  return {
    irr: baseIRR * holdPeriodMultiplier * renovationMultiplier * rentGrowthMultiplier * exitCapMultiplier,
    equityMultiple: baseEM * holdPeriodMultiplier * exitCapMultiplier,
    cashOnCash: baseCOC * rentGrowthMultiplier,
    dscr: baseDSCR * (assumptions.financingMix / 75),
    payback: assumptions.holdPeriod * 0.8,
  }
}
