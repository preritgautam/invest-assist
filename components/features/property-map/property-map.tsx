"use client"

import type React from "react"
import { useState } from "react"
import { MapPin, Building, DollarSign, TrendingUp } from "lucide-react"
import type { PropertyData } from "@/lib/property-data"
import { Badge } from "@/components/ui/badge"

interface PropertyMapProps {
  properties: PropertyData[]
  onPropertyClick?: (propertyId: string) => void
}

interface MapMarkerProps {
  property: PropertyData
  onClick?: () => void
  isSelected?: boolean
}

const MapMarker: React.FC<MapMarkerProps> = ({ property, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      {/* Property Marker */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative z-10 w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all duration-200 flex items-center justify-center ${
          isSelected ? "bg-gray-900 scale-110" : isHovered ? "bg-gray-700 scale-105" : "bg-gray-600 hover:bg-gray-700"
        }`}
      >
        <Building className="w-4 h-4 text-white" />
      </button>

      {/* Property Info Popup */}
      {(isHovered || isSelected) && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px] z-20">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-bold text-gray-900">{property.name}</h4>
            <Badge variant="secondary" className="text-xs">
              {property.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {property.address}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-gray-500" />
              <span className="font-medium">{property.offerPrice}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-gray-500" />
              <span className="font-medium">{property.capRate}</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">{property.units} units</div>
        </div>
      )}
    </div>
  )
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onPropertyClick }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  // Calculate map bounds based on property coordinates
  const coordinates = properties.filter((p) => p.coordinates).map((p) => p.coordinates!)

  if (coordinates.length === 0) {
    return (
      <div className="h-96 bg-gray-50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No properties with coordinates found</p>
        </div>
      </div>
    )
  }

  const minLat = Math.min(...coordinates.map((c) => c.lat))
  const maxLat = Math.max(...coordinates.map((c) => c.lat))
  const minLng = Math.min(...coordinates.map((c) => c.lng))
  const maxLng = Math.max(...coordinates.map((c) => c.lng))

  // Center point
  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2

  // Convert coordinates to pixel positions (simplified projection)
  const mapWidth = 100 // percentage
  const mapHeight = 100 // percentage

  const getMarkerPosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10 // 10% margin on each side
    const y = ((maxLat - lat) / (maxLat - minLat)) * 80 + 10 // Inverted Y axis, 10% margin
    return { x, y }
  }

  const handleMarkerClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    if (onPropertyClick) {
      onPropertyClick(propertyId)
    }
  }

  return (
    <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl overflow-hidden border border-gray-200">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Geographic Labels */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Portfolio Map</h3>
        <p className="text-xs text-gray-600">
          {properties.length} properties across{" "}
          {new Set(properties.map((p) => p.address.split(", ").slice(-2, -1)[0])).size} markets
        </p>
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <span className="text-gray-700">Active Properties</span>
        </div>
      </div>

      {/* Property Markers */}
      {properties
        .filter((property) => property.coordinates)
        .map((property) => {
          const position = getMarkerPosition(property.coordinates!.lat, property.coordinates!.lng)
          return (
            <div
              key={property.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              <MapMarker
                property={property}
                onClick={() => handleMarkerClick(property.id)}
                isSelected={selectedPropertyId === property.id}
              />
            </div>
          )
        })}

      {/* Market Labels */}
      {properties
        .filter((property) => property.coordinates)
        .map((property) => {
          const position = getMarkerPosition(property.coordinates!.lat, property.coordinates!.lng)
          const city = property.address.split(", ").slice(-2, -1)[0]
          return (
            <div
              key={`${property.id}-label`}
              className="absolute transform -translate-x-1/2 translate-y-8 pointer-events-none"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                {city}
              </div>
            </div>
          )
        })}

      {/* Property Summary Panel */}
      {selectedPropertyId && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          {(() => {
            const selectedProperty = properties.find((p) => p.id === selectedPropertyId)
            if (!selectedProperty) return null

            return (
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={selectedProperty.thumbnail || "/placeholder.svg?height=48&width=64&query=apartment building"}
                    alt={selectedProperty.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{selectedProperty.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {selectedProperty.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{selectedProperty.address}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span>
                      <strong>Price:</strong> {selectedProperty.offerPrice}
                    </span>
                    <span>
                      <strong>Cap Rate:</strong> {selectedProperty.capRate}
                    </span>
                    <span>
                      <strong>Units:</strong> {selectedProperty.units}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPropertyId(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
