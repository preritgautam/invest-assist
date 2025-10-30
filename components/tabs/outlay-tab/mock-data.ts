/**
 * Mock data for Sources & Uses of Funds
 */

import type { LineItem } from "./types"

export const initialSourcesAtClosing: LineItem[] = [
  { id: "1", item: "Equity Capital", amount: 5100000, percentage: 15.0 },
  { id: "2", item: "Sr. Debt", amount: 11900000, percentage: 35.0 },
  { id: "3", item: "Refinance", amount: 0, percentage: 0 },
  { id: "4", item: "Other", amount: 0, percentage: 0 },
  { id: "5", item: "Less: Proceeds Used for Refinancing", amount: 0, percentage: 0 },
  { id: "6", item: "Less: Loan Proceeds Distributed", amount: 0, percentage: 0 },
]

export const initialUsesAtClosing: LineItem[] = [
  { id: "1", item: "Purchase Price", amount: 17000000, perUnit: 425000, percentage: 47.0 },
  { id: "2", item: "Closing Costs (excl. financing)", amount: 340000, perUnit: 8500, percentage: 0.9 },
  { id: "3", item: "Reserve for Projected Capital Expenditures", amount: 760000, percentage: 2.1 },
  { id: "4", item: "Loan Closing Costs", amount: 150000, percentage: 0.4 },
  { id: "5", item: "Funding of Reserves", amount: 200000, percentage: 0.6 },
]

export const initialSourcesOverHold: LineItem[] = [
  { id: "1", item: "Equity Capital", amount: 850000, percentage: 5.0 },
  { id: "2", item: "Cash Flow (Funded Through Operations)", amount: 1200000, percentage: 7.0 },
]

export const initialUsesOverHold: LineItem[] = [
  { id: "1", item: "Other CapEx", amount: 500000, percentage: 2.9 },
  { id: "2", item: "Unit Renovation", amount: 800000, perUnit: 20000, percentage: 4.7 },
  { id: "3", item: "Replacement Reserves (per unit)", amount: 300000, perUnit: 7500, percentage: 1.8 },
  { id: "4", item: "TI/LC (Tenant Improvements / Leasing Commissions)", amount: 200000, percentage: 1.2 },
  { id: "5", item: "Operating Deficit", amount: 150000, percentage: 0.9 },
  { id: "6", item: "Loan Paydown With Equity", amount: 0, percentage: 0 },
  { id: "7", item: "Distributions to Investors", amount: 100000, percentage: 0.6 },
]
