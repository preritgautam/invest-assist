/**
 * Utility functions for Capital Tab component
 */

/**
 * Format numeric values as currency
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Parse currency string to number
 * @param value - Currency string to parse
 * @returns Numeric value
 */
export const parseCurrency = (value: string): number => {
  return Number.parseFloat(value.replace(/[$,]/g, "")) || 0
}

/**
 * Field labels for amortization data
 */
export const AMORTIZATION_FIELD_LABELS: Record<string, string> = {
  beginningBalance: "Beginning Balance",
  drawdowns: "Drawdowns",
  interestExpense: "Interest Expense",
  amortization: "Amortization",
  repayments: "Repayments",
  endingBalance: "Ending Balance",
}

/**
 * Amortization field keys in display order
 */
export const AMORTIZATION_FIELDS = [
  "beginningBalance",
  "drawdowns",
  "interestExpense",
  "amortization",
  "repayments",
  "endingBalance",
] as const
