/**
 * Type definitions for the Sources & Uses of Funds Tab
 */

import type { PropertyData } from "@/lib/property-data"

/**
 * Props interface for the OutlayTab component
 */
export interface SourcesUsesTabProps {
  property: PropertyData | null
}

/**
 * Interface representing a financial line item in sources and uses tables
 */
export interface LineItem {
  id: string
  item: string
  amount: number
  perUnit?: number
  percentage: number
  isEdited?: boolean
}

/**
 * Props for EditableCell component
 */
export interface EditableCellProps {
  value: string | number
  type?: "text" | "currency" | "number"
  cellId: string
  onUpdate: (value: string | number) => void
}
