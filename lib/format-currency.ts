/**
 * Format a number as currency with consistent locale
 * Always uses en-US locale to ensure server/client match
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US')
}

/**
 * Format a number as currency, wrapping negative values in parentheses
 */
export function formatCurrencyWithParens(value: number): string {
  if (value < 0) {
    return `($${Math.abs(value).toLocaleString('en-US')})`
  }
  return `$${value.toLocaleString('en-US')}`
}

/**
 * Format a plain number with consistent locale
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}
