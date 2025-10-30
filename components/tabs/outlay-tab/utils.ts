/**
 * Utility functions for the Sources & Uses of Funds Tab
 */

/**
 * Formats a number as currency with comma separators
 */
export const formatCurrency = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Parses a currency string back to numeric value
 */
export const parseCurrency = (value: string): number => {
  return Number.parseInt(value.replace(/,/g, "")) || 0
}

/**
 * Calculates percentage of total
 */
export const calculatePercentage = (amount: number, total: number): string => {
  return total > 0 ? ((amount / total) * 100).toFixed(1) : "0"
}
