/**
 * Mock data for Business Plan Tab
 */

import type { SystemSuggestion } from "./types"

export const systemSuggestion: SystemSuggestion = {
  holdPeriod: 5,
  renovationBudget: 10000,
  exitCap: 5.25,
  rentGrowth: "2.5% Annual Growth",
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
