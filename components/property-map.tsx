/**
 * PropertyMap Component
 *
 * An interactive property map visualization component that displays real estate properties
 * on a mock map interface with markers, popups, and property listings. Provides map controls
 * for different views, traffic overlay, and fullscreen functionality.
 *
 * @features
 * - Interactive property markers with click handlers
 * - Property information popups on selection
 * - Map view toggles (street/satellite)
 * - Traffic overlay visualization
 * - Fullscreen mode support
 * - Responsive design for mobile/tablet/desktop
 * - Property list view with status indicators
 *
 * @author Real Estate Analysis Team
 * @version 1.0.0
 */

"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Maximize2, Minimize2, Layers, Search } from "lucide-react"
import { useState } from "react"

/**
 * Property interface defining the structure of property data
 * Used for both real property data and mock data generation
 */
interface Property {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  isActive: boolean
  propertyType: string
  units?: number
  sqft?: number
}

/**
 * Props interface for the PropertyMap component
 * @param properties - Array of properties to display on the map
 * @param activeProperty - Currently selected property (highlighted)
 * @param onPropertySelect - Callback function when a property is selected
 */
interface PropertyMapProps {
  properties: Property[]
  activeProperty?: Property | null
  onPropertySelect?: (property: Property) => void
}

/**
 * PropertyMap Component
 *
 * Renders an interactive map interface showing property locations with markers,
 * popups, and various map controls. Includes both map view and list view of properties.
 */
export function PropertyMap({ properties, activeProperty, onPropertySelect }: PropertyMapProps) {
  // State management for map interface controls
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapView, setMapView] = useState<"satellite" | "street" | "hybrid">("street")
  const [showTraffic, setShowTraffic] = useState(false)

  // Mock property data for demonstration when no real properties are provided
  // In production, this would be replaced with actual property data from API
  const mockProperties: Property[] =
    properties.length > 0
      ? properties
      : [
          {
            id: "1",
            name: "Sunset Gardens",
            address: "123 Main St, San Francisco, CA",
            lat: 37.7749,
            lng: -122.4194,
            isActive: true,
            propertyType: "Multifamily",
            units: 40,
            sqft: 35000,
          },
          {
            id: "2",
            name: "Downtown Plaza",
            address: "456 Market St, San Francisco, CA",
            lat: 37.7849,
            lng: -122.4094,
            isActive: false,
            propertyType: "Mixed Use",
            units: 60,
            sqft: 50000,
          },
        ]

  /**
   * Handles property marker click events
   * Triggers the onPropertySelect callback if provided
   * @param property - The property that was clicked
   */
  const handlePropertyClick = (property: Property) => {
    if (onPropertySelect) {
      onPropertySelect(property)
    }
  }

  return (
    <Card
      className={`bg-white rounded-2xl shadow-lg border-2 border-white transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50" : ""
      }`}
    >
      {/* Map Header with Controls */}
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">Property Map</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Interactive map view of your properties</p>
            </div>
          </div>

          {/* Map Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Traffic Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTraffic(!showTraffic)}
              className={`h-8 text-xs ${showTraffic ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Traffic
            </Button>

            {/* Map View Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMapView(mapView === "street" ? "satellite" : "street")}
              className="h-8 text-xs"
            >
              <Layers className="w-3 h-3 mr-1" />
              {mapView === "street" ? "Satellite" : "Street"}
            </Button>

            {/* Fullscreen Toggle Button */}
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8 w-8 p-0">
              {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Mock Map Container */}
        {/* In production, this would be replaced with actual map integration (Google Maps, Mapbox, etc.) */}
        <div
          className={`relative bg-gray-100 rounded-lg overflow-hidden ${
            isFullscreen ? "h-[calc(100vh-200px)]" : "h-64 sm:h-80"
          }`}
        >
          {/* Map Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
            {/* Mock Street Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Mock Road Network */}
            <div className="absolute top-1/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
            <div className="absolute top-2/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
            <div className="absolute top-0 bottom-0 left-1/4 w-2 bg-gray-300 opacity-60"></div>
            <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-gray-300 opacity-60"></div>
          </div>

          {/* Property Markers */}
          {mockProperties.map((property, index) => (
            <div
              key={property.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                activeProperty?.id === property.id ? "z-20" : "z-10"
              }`}
              style={{
                // Position markers in a distributed pattern across the map
                left: `${25 + index * 30}%`,
                top: `${30 + index * 20}%`,
              }}
              onClick={() => handlePropertyClick(property)}
            >
              {/* Marker Pin with Animation */}
              <div className={`relative ${activeProperty?.id === property.id ? "animate-bounce" : ""}`}>
                {/* Circular Marker */}
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                    property.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-white" />
                </div>

                {/* Property Information Popup */}
                {activeProperty?.id === property.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-30">
                    <div className="text-sm font-semibold text-gray-900 mb-1">{property.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{property.address}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {property.propertyType}
                      </Badge>
                      <Badge variant={property.isActive ? "default" : "secondary"} className="text-xs">
                        {property.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {property.units && (
                      <div className="text-xs text-gray-500">
                        {property.units} units • {property.sqft?.toLocaleString()} sq ft
                      </div>
                    )}

                    {/* Popup Arrow Pointer */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Map Control Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white shadow-md">
              <Search className="w-3 h-3" />
            </Button>
          </div>

          {/* Zoom Control Buttons */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white shadow-md text-lg font-bold">
              +
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white shadow-md text-lg font-bold">
              −
            </Button>
          </div>

          {/* Traffic Overlay */}
          {/* Animated traffic indicators showing different congestion levels */}
          {showTraffic && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-1/4 right-1/3 h-1 bg-red-500 opacity-60 animate-pulse"></div>
              <div className="absolute top-2/3 left-1/2 right-1/4 h-1 bg-yellow-500 opacity-60 animate-pulse"></div>
              <div className="absolute top-1/2 bottom-1/4 left-1/4 w-1 bg-green-500 opacity-60 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Property List Section */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Properties ({mockProperties.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mockProperties.map((property) => (
              <div
                key={property.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeProperty?.id === property.id
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => handlePropertyClick(property)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{property.name}</div>
                    <div className="text-xs text-gray-600">{property.address}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={property.isActive ? "default" : "secondary"} className="text-xs">
                      {property.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className={`w-3 h-3 rounded-full ${property.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
