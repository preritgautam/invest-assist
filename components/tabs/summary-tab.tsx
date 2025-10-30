/**
 * Summary Tab Component - Investment Summary Display
 *
 * This component provides a high-level investment summary for selected properties.
 * Currently serves as a placeholder that will be populated with comprehensive
 * financial metrics, property gallery, and investment analysis data.
 *
 * Key Features:
 * - Property selection state handling
 * - Placeholder content for future development
 * - Responsive design with mobile-first approach
 * - Integration with property data store
 *
 * @component
 * @example
 * <SummaryTab property={selectedProperty} />
 */

"use client"

import type React from "react"
import { Building, Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPropertyById } from "@/lib/property-data"

/**
 * Basic property interface for summary display
 * Contains minimal property information needed for summary
 */
interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

/**
 * Props interface for SummaryTab component
 */
interface SummaryTabProps {
  /** Property object containing basic property information, or null if no property selected */
  property: Property | null
}

/**
 * Reusable info card component for displaying summary details
 * Provides consistent styling across summary sections
 */
function InfoCard({
  title,
  children,
  className = "",
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-white shadow-sm ${className}`}>
      <h3 className="text-xs font-semibold text-gray-600 mb-2">{title}</h3>
      {children}
    </div>
  )
}

/**
 * Reusable section card component with icon and header
 * Used for organizing different summary sections
 */
function SectionCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`bg-white rounded-xl shadow-lg border-2 border-white ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
          <CardTitle className="text-sm font-bold text-gray-900">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

/**
 * SummaryTab Component - Investment summary display
 *
 * Displays investment summary information for selected properties.
 * Handles three states: no property selected, property selected but no data,
 * and property with data (future implementation).
 */
export function SummaryTab({ property }: SummaryTabProps) {
  // Handle case where no property is selected
  if (!property) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-4 sm:p-6 lg:p-8 text-center">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Investment Summary</h2>
        <p className="text-sm sm:text-base text-gray-600">Select a property to view summary details.</p>
      </div>
    )
  }

  // Attempt to get detailed property data from the data store
  const propertyData = getPropertyById(property.id)

  // Handle case where property is selected but no detailed data exists
  if (!propertyData) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-4 sm:p-6 lg:p-8 text-center">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">{property.name}</h2>
        <p className="text-sm sm:text-base text-gray-600">No data available for this property yet.</p>
        <p className="text-xs text-gray-500 mt-2">Property data will be populated when you add financial details.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Property header section with basic information */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-white p-2 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
            <Building className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">{property.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600">Investment Summary</p>
          </div>
        </div>
      </div>

      {/* Placeholder content for future summary data */}
      <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Summary Data Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          Financial metrics, property gallery, and investment analysis will be populated when you add property details.
        </p>
        {/* List of planned summary features */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>• Key Metrics (Offer Price, Cap Rate, IRR, etc.)</p>
          <p>• Property Gallery & Information</p>
          <p>• Pro Forma Projections</p>
          <p>• Investment Returns Analysis</p>
          <p>• Sources & Uses Breakdown</p>
          <p>• Business Plan Highlights</p>
        </div>
      </div>
    </div>
  )
}
