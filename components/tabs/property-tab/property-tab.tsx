/**
 * Property Tab Component - Detailed Property Information Display
 *
 * This component provides comprehensive property details including images, location,
 * specifications, unit mix, and market intelligence. It serves as the main property
 * information hub with interactive maps, financial metrics, and neighborhood analysis.
 *
 * Key Features:
 * - Property image gallery and main photo display
 * - Interactive Google Maps integration with location details
 * - Property specifications and building information
 * - Unit mix table with market and post-renovation rents
 * - Market intelligence with demographics and amenities
 * - AI-powered investment summary and analysis
 *
 * @component
 * @example
 * <PropertyTab property={selectedProperty} />
 */

"use client"
import type React from "react"
import {
  Building,
  Calendar,
  Home,
  TrendingUp,
  Brain,
  Car,
  GraduationCap,
  Shield,
  Stethoscope,
  MapIcon,
  BarChart3,
  Navigation,
} from "lucide-react"
import { getPropertyById, type PropertyData } from "@/lib/property-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PropertyImageCarousel from "./property-images"
import UnitMix from "./unitMix"
 import WalkScore from "./walkscore"
import { useEffect, useState } from "react"

/**
 * Props interface for PropertyTab component
 */
interface PropertyTabProps {
  /** Property data object containing all property information, or null if no property selected */
  property: PropertyData | null
  /** Optional database property ID for fetching images and OM data from the API */
  propertyId?: string
  /** Optional documents array */
  documents?: any[]
}

/**
 * PropertyTab Component - Comprehensive property details display
 *
 * Renders detailed property information including images, location data,
 * specifications, unit mix, and market analysis. Handles null property state
 * with appropriate placeholder content.
 */
export function PropertyTab({ property, propertyId, documents }: PropertyTabProps) {
  // Handle case where no property is selected AND no propertyId is provided
const [propertyDetails, setPropertyDetails] = useState<{
  name?: string;
  address?: string;
  city?: string;
}>({});
console.log("[PropertyTab] propertyId:", propertyDetails)


  useEffect(() => {
  if (!propertyId) return;

  const fetchOmData = async () => {
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/om-data`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch OM data");
      }

      const omData = await response.json();

      console.log("[OM Data] Fetched OM data:", omData);

      if (omData.success) {
        setPropertyDetails({
          name: omData.omExtraction.property_info.property_name,
          address: omData.omExtraction.property_info.property_address,
          city: omData.omExtraction.property_info.city,
        });
      }
    } catch (error) {
      console.error("[OM Data] Error fetching OM data:", error);
    }
  };

  fetchOmData();
}, [propertyId]);

  
  if (!property && !propertyId) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-sm font-bold text-gray-900 mb-2">Property Details</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Select a property from the Home tab to view its details here.
        </p>
      </div>
    )
  }

  console.log("[PropertyTab] Rendering property tab for property:", propertyId)

  // Create a minimal propertyData for cases where we only have propertyId (database property)
  const propertyData: PropertyData = property || {
      address: 'aqua  apartments, tallahassee',
    units: 0,
    status: 'Active',
  }

  // For database-only properties (no mock data), show a simplified view with just images
  const isDatabaseOnlyProperty = !property && propertyId

  return (
    <div className="space-y-4">
      {/* Property header with basic information - only show if we have real property data */}
      {!isDatabaseOnlyProperty && (
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">


          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />


              </div>

              <div>

                <CardTitle className="text-sm font-bold text-gray-900">{propertyData.name}</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">{propertyData.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Dynamic status badge with conditional styling */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${propertyData.status === "Active"
                      ? "bg-gray-100 text-gray-800"
                      : propertyData.status === "Under Review"
                        ? "bg-gray-200 text-gray-800"
                        : propertyData.status === "Draft"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {propertyData.status}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

              <div>
                <WalkScore
                  address={propertyDetails.address && propertyDetails.city 
                    ? `${propertyDetails.name || ''}, ${propertyDetails.address}, ${propertyDetails.city}`.replace(/^, /, '') 
                    : propertyData.address}
                  lat={propertyData.coordinates?.lat}
                  lon={propertyData.coordinates?.lng}
                />
              </div>
      {/* Main property image section - always show when we have propertyId */}
      <PropertyImageCarousel propertyData={propertyData} propertyId={propertyId || property?.id} />

      {/* Interactive location section with Google Maps */}
      {propertyData.coordinates && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Location</h2>
            <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
          </div>

          <Card className="bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MapIcon className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Interactive Map View</h3>
                  <p className="text-sm text-gray-600">Explore the property location and surrounding area</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Embedded Google Maps iframe */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[16/10] relative">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d${propertyData.coordinates.lng}!3d${propertyData.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMCcyMS4yIk4gNzPCsDU5JzA2LjQiVw!5e0!3m2!1sen!2sus!4v1635959385076!5m2!1sen!2sus&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  ></iframe>
                </div>
              </div>

              {/* Location details grid */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                  Location Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address and coordinates card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Navigation className="w-5 h-5 text-gray-700" />
                      </div>
                      <h5 className="font-bold text-gray-900">Address & Coordinates</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Full Address</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                          {propertyData.address}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Latitude</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {propertyData.coordinates.lat.toFixed(6)}°
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Longitude</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {propertyData.coordinates.lng.toFixed(6)}°
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Neighborhood highlights card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building className="w-5 h-5 text-gray-700" />
                      </div>
                      <h5 className="font-bold text-gray-900">Neighborhood Highlights</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Walk Score</span>
                        <span className="text-sm font-semibold text-gray-900">92/100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Transit Score</span>
                        <span className="text-sm font-semibold text-gray-900">85/100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bike Score</span>
                        <span className="text-sm font-semibold text-gray-900">78/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location intelligence call-to-action */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <MapIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold">Location Intelligence</h4>
                </div>
                <p className="text-gray-100 leading-relaxed mb-4">
                  This property is strategically located in a highly walkable area with excellent public transportation
                  access and bike-friendly infrastructure. The location provides residents with convenient access to
                  employment centers, shopping, dining, and recreational amenities.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border border-white/20">
                    View Street View
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border border-white/20">
                    Get Directions
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border border-white/20">
                    Nearby Amenities
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Property specifications section */}
      {(propertyData.yearBuilt || propertyData.occupancy || propertyData.holdPeriod) && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Information</h2>
            <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
          </div>

          <Card className="bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Building className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Property Details</h3>
                  <p className="text-sm text-gray-600">Comprehensive property specifications and metrics</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Financial overview section */}
              {propertyData.whisperPrice && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                    Financial Overview
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <TrendingUp className="w-5 h-5 text-gray-700" />
                      </div>
                      <h5 className="font-bold text-gray-900">Whisper Price Analysis</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Cap Rate</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${propertyData.whisperPrice.cap.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="text-center bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Per Unit</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${propertyData.whisperPrice.perUnit.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="text-center bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Total Value</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${propertyData.whisperPrice.total.toLocaleString('en-US')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Property specifications grid */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                  Property Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Building details card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Calendar className="w-5 h-5 text-gray-700" />
                      </div>
                      <h5 className="font-bold text-gray-900">Building Details</h5>
                    </div>
                    <div className="space-y-2">
                      {propertyData.yearBuilt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Year Built</span>
                          <span className="text-sm font-semibold text-gray-900">{propertyData.yearBuilt}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Units</span>
                        <span className="text-sm font-semibold text-gray-900">{propertyData.units}</span>
                      </div>
                      {propertyData.occupancy && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Occupancy Rate</span>
                          <span className="text-sm font-semibold text-gray-900">{propertyData.occupancy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unit metrics card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Home className="w-5 h-5 text-gray-700" />
                      </div>
                      <h5 className="font-bold text-gray-900">Unit Metrics</h5>
                    </div>
                    <div className="space-y-2">
                      {propertyData.avgSqFtPerUnit && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg. Square Feet</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {propertyData.avgSqFtPerUnit} sq ft
                          </span>
                        </div>
                      )}
                      {propertyData.pricePerSqFt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Price per Sq Ft</span>
                          <span className="text-sm font-semibold text-gray-900">{propertyData.pricePerSqFt}</span>
                        </div>
                      )}
                      {propertyData.holdPeriod && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Hold Period</span>
                          <span className="text-sm font-semibold text-gray-900">{propertyData.holdPeriod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment highlights summary */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold">Investment Highlights</h4>
                </div>
                <p className="text-gray-100 leading-relaxed">
                  This {propertyData.units}-unit property built in {propertyData.yearBuilt || "N/A"} represents a solid
                  investment opportunity with {propertyData.occupancy || "strong occupancy"} and well-maintained
                  facilities. The property's specifications align with current market demands, offering potential for
                  stable cash flow and long-term appreciation in this desirable location.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Unit mix table section */}
      <UnitMix documents={documents} />

      {/* Market intelligence and commentary section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Commentary</h2>
          <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
        </div>

        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Brain className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Market Intelligence</h3>
                <p className="text-sm text-gray-600">Comprehensive property and location analysis</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Location and accessibility analysis */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                Location & Accessibility
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transportation details */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Navigation className="w-5 h-5 text-gray-700" />
                    </div>
                    <h5 className="font-bold text-gray-900">Transportation</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Highway Access</span>
                      <span className="text-sm font-semibold text-gray-900">0.8 mi to I-95</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Metro Station</span>
                      <span className="text-sm font-semibold text-gray-900">0.3 mi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bus Routes</span>
                      <span className="text-sm font-semibold text-gray-900">4 lines</span>
                    </div>
                  </div>
                </div>

                {/* Parking information */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Car className="w-5 h-5 text-gray-700" />
                    </div>
                    <h5 className="font-bold text-gray-900">Parking</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Garage Spaces</span>
                      <span className="text-sm font-semibold text-gray-900">120 spots</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Street Parking</span>
                      <span className="text-sm font-semibold text-gray-900">Limited</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographics and safety information */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                Demographics & Safety
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Demographics data */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <BarChart3 className="w-5 h-5 text-gray-700" />
                    </div>
                    <h5 className="font-bold text-gray-900">Demographics</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Median Income</span>
                      <span className="text-sm font-semibold text-gray-900">$78,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Population</span>
                      <span className="text-sm font-semibold text-gray-900">45,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Median Age</span>
                      <span className="text-sm font-semibold text-gray-900">32 years</span>
                    </div>
                  </div>
                </div>

                {/* Safety metrics */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Shield className="w-5 h-5 text-gray-700" />
                    </div>
                    <h5 className="font-bold text-gray-900">Safety</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Crime Rate</span>
                      <span className="text-sm font-semibold text-gray-900">Below Average</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Safety Score</span>
                      <span className="text-sm font-semibold text-gray-900">7.2/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities and services information */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                Amenities & Services
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schools information */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <GraduationCap className="w-5 h-5 text-gray-700" />
                    </div>
                    <h5 className="font-bold text-gray-900">Schools</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Elementary</span>
                      <span className="text-sm font-semibold text-gray-900">0.4 mi (8.5/10)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">High School</span>
                      <span className="text-sm font-semibold text-gray-900">1.2 mi (7.8/10)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">University</span>
                      <span className="text-sm font-semibold text-gray-900">3.1 mi</span>
                    </div>
                  </div>
                </div>

                {/* Healthcare facilities */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Stethoscope className="w-5 h-5 text-gray-700" />
                    </div>
                    <h5 className="font-bold text-gray-900">Healthcare</h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Hospital</span>
                      <span className="text-sm font-semibold text-gray-900">2.1 mi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Urgent Care</span>
                      <span className="text-sm font-semibold text-gray-900">0.7 mi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pharmacies</span>
                      <span className="text-sm font-semibold text-gray-900">3 within 1 mi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market analysis with comparable properties */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                Market Analysis
              </h4>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapIcon className="w-5 h-5 text-gray-700" />
                  </div>
                  <h5 className="font-bold text-gray-900">Market Comparables</h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Avg. Rent (1BR)</div>
                    <div className="text-lg font-bold text-gray-900">$1,925</div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Avg. Rent (2BR)</div>
                    <div className="text-lg font-bold text-gray-900">$2,550</div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Vacancy Rate</div>
                    <div className="text-lg font-bold text-gray-900">4.2%</div>
                    <div className="text-xs text-gray-500">market avg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Price/Sq Ft</div>
                    <div className="text-lg font-bold text-gray-900">$145-165</div>
                    <div className="text-xs text-gray-500">range</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI-powered investment summary */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold">AI Investment Summary</h4>
              </div>
              <p className="text-gray-100 leading-relaxed">
                This property is exceptionally well-positioned in a growing downtown district with excellent
                transportation access and strong demographics. The location benefits from proximity to major employment
                centers and educational institutions. Current market rents suggest potential for 8-12% rent growth over
                the next 2-3 years. The area's low crime rate and improving infrastructure make it highly attractive to
                young professionals and families, positioning this as a strong long-term investment opportunity.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Call-to-action for incomplete property data */}
      {!propertyData.keyMetrics && (
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Complete Property Analysis</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Add detailed financial metrics, property images, and unit mix information to get a complete investment
              analysis.
            </p>
            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-xs font-medium">
              Add Details
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
