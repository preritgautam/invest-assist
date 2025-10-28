/**
 * Pro Forma Tab Component - Financial Projections Display
 *
 * This component displays detailed pro forma financial projections for properties,
 * including multi-year NOI forecasts, growth rate analysis, and key investment metrics.
 *
 * Key Features:
 * - Multi-year NOI projection table with growth rate calculations
 * - Key financial metrics cards (growth rate, total NOI, cap rate)
 * - Responsive design with mobile-optimized tables
 * - Dynamic data handling with fallback defaults
 * - Color-coded financial indicators
 *
 * @component
 * @example
 * <ProFormaTab property={selectedProperty} />
 */

"use client"
import type { PropertyData } from "@/lib/property-data"
import { ProFormaSpreadsheet } from "./pro-forma-spreadsheet"

/**
 * Props interface for ProFormaTab component
 */
interface ProFormaTabProps {
  /** Property data object containing pro forma information, or null if no property selected */
  property: PropertyData | null
}

/**
 * ProFormaTab Component - Financial projections and analysis
 *
 * Displays comprehensive pro forma analysis including NOI projections,
 * growth rates, and key investment metrics for the selected property.
 */
export function ProFormaTab({ property }: ProFormaTabProps) {
  return <ProFormaSpreadsheet property={property} />
}
