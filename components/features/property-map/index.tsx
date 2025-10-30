/**
 * Property Map Feature Component
 *
 * This component provides an interactive map visualization for displaying
 * multiple properties with markers. Users can select properties on the map
 * to view details and navigate between different property locations.
 *
 * @component
 * @example
 * <PropertyMap
 *   properties={propertyList}
 *   activeProperty={selectedProperty}
 *   onPropertySelect={handlePropertySelect}
 * />
 */

"use client"

import { useState } from "react"
import { MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react"
import type { PropertyData } from "@/lib/property-data"

/**
 * Props interface for the PropertyMap component
 */
interface PropertyMapProps {
  /** Array of properties to display on the map */
  properties: PropertyData[]
  /** Currently active/selected property */
  activeProperty: PropertyData | null
  /** Callback function when a property is selected on the map */
  onPropertySelect: (property: PropertyData) => void
}

/**
 * PropertyMap Component
 *
 * Renders an interactive map with property markers. Supports property selection,
 * zoom controls, and displays property information on marker hover/click.
 */
export function PropertyMap({ properties, activeProperty, onPropertySelect }: PropertyMapProps) {
  const [zoom, setZoom] = useState(12)
  const [hoveredProperty, setHoveredProperty] = useState<PropertyData | null>(null)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 20))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 1))
  }

  const handleRecenter = () => {
    // Recenter logic would go here
    console.log("[v0] Recentering map on active property")
  }

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      {/* Map placeholder with grid pattern */}
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #9ca3af 1px, transparent 1px),
              linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Property markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-4xl">
            {properties
              .filter((property) => property.coordinates)
              .map((property, index) => {
                const isActive = activeProperty?.id === property.id
                // Position markers in a grid-like pattern for demo
                const x = 20 + (index % 3) * 30
                const y = 20 + Math.floor(index / 3) * 30

                return (
                  <div
                    key={property.id}
                    className="absolute cursor-pointer transition-transform hover:scale-110"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => onPropertySelect(property)}
                    onMouseEnter={() => setHoveredProperty(property)}
                    onMouseLeave={() => setHoveredProperty(null)}
                  >
                    {/* Marker pin */}
                    <div
                      className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors ${
                        isActive ? "bg-gray-800" : "bg-gray-400"
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>

                    {/* Info popup on hover */}
                    {hoveredProperty?.id === property.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl p-3 z-10">
                        <h3 className="font-bold text-sm mb-1">{property.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{property.address}</p>
                        <p className="text-xs">
                          <strong>{property.units} units</strong> • {property.status}
                        </p>
                        {/* Arrow pointer */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">Map View</div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        {activeProperty && (
          <button
            onClick={handleRecenter}
            className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="Recenter on Active Property"
          >
            <Navigation className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Zoom level indicator */}
      <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg shadow-lg">
        <span className="text-xs font-medium text-gray-700">Zoom: {zoom}</span>
      </div>

      {/* Property count indicator */}
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-semibold text-gray-900">
            {properties.filter((p) => p.coordinates).length} Properties
          </span>
        </div>
      </div>
    </div>
  )
}
