/**
 * Home Tab Component - Property Portfolio Dashboard
 *
 * This component serves as the main dashboard for property portfolio management,
 * providing multiple view modes (card, list, map) and comprehensive property overview.
 *
 * Key Features:
 * - Property portfolio overview with key metrics
 * - Multiple view modes for property display
 * - Property search and filtering
 * - Add/edit/delete property functionality
 * - Use case sidebar with analysis tools
 * - Interactive property cards with dropdown actions
 *
 * @component
 * @example
 * <HomeTab onPropertyEdit={(id) => handleEdit(id)} />
 */

"use client"

import type React from "react"
import { useState } from "react"
import {
  Building,
  Plus,
  MapPin,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
  Calculator,
  PieChart,
  Grid3X3,
  List,
  Map,
  Search,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { type PropertyData, getAllProperties, addProperty } from "@/lib/property-data"
import { AppCard, MetricCard } from "@/components/ui/app-card"
import { AppButton } from "@/components/ui/app-button"
import { AppIcon } from "@/components/ui/app-icons"
import { PropertyMap } from "@/components/property-map"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UploadDialog } from "@/components/features/property-upload/upload-dialog"

/**
 * Props interface for HomeTab component
 */
interface HomeTabProps {
  /** Callback function triggered when a property is selected for editing */
  onPropertyEdit?: (propertyId: string) => void
}

/**
 * Available view modes for property display
 */
type ViewMode = "card" | "list" | "map"

/**
 * HomeTab Component - Main property portfolio dashboard
 *
 * Displays property portfolio with multiple view modes, search functionality,
 * and comprehensive property management features.
 */
export function HomeTab({ onPropertyEdit }: HomeTabProps) {
  // State management for view mode, properties, and search
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [properties] = useState<PropertyData[]>(getAllProperties())
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  /**
   * Handles property card click events
   * Prevents event bubbling and triggers edit callback
   */
  const handlePropertyClick = (propertyId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (onPropertyEdit) {
      onPropertyEdit(propertyId)
    }
  }

  /**
   * Creates a new property with default values
   * Adds it to the property data store
   */
  const handleAddProperty = () => {
    setShowUploadDialog(true)
  }

  /**
   * Handles completion of file upload process
   * Creates property based on uploaded files
   */
  const handleUploadComplete = (files: any[]) => {
    console.log("[v0] Upload complete with files:", files)
    // For now, create a default property
    // In Step B, this will process the uploaded files
    const newProperty: PropertyData = {
      id: `prop${Date.now()}`,
      name: "New Property",
      address: "Enter address...",
      status: "Draft",
      thumbnail: "/modern-apartment-building.png",
      offerPrice: "$0.0M",
      capRate: "0.0%",
      units: 0,
    }
    addProperty(newProperty)
  }

  /**
   * Handles edit property action from dropdown menu
   * Prevents event bubbling and triggers edit callback
   */
  const handleEditProperty = (propertyId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (onPropertyEdit) {
      onPropertyEdit(propertyId)
    }
  }

  /**
   * Handles delete property action from dropdown menu
   * Currently shows alert - to be implemented with actual deletion logic
   */
  const handleDeleteProperty = (propertyId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    alert(`Delete property ${propertyId} - functionality to be implemented`)
  }

  // Calculate portfolio summary metrics
  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, prop) => {
    const value = Number.parseFloat(prop.offerPrice.replace(/[$M,]/g, "")) || 0
    return sum + value
  }, 0)
  const avgCapRate =
    properties.length > 0
      ? properties.reduce((sum, prop) => sum + (Number.parseFloat(prop.capRate.replace("%", "")) || 0), 0) /
        properties.length
      : 0
  const totalUnits = properties.reduce((sum, prop) => sum + (prop.units || 0), 0)

  /**
   * Reusable view mode button component
   * Handles active state styling and click events
   */
  const ViewModeButton = ({ mode, icon, label }: { mode: ViewMode; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
        viewMode === mode ? "bg-gray-900 text-white shadow-lg" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <AppIcon size="sm">{icon}</AppIcon>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <UploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onComplete={handleUploadComplete}
      />

      {/* Mobile-specific add property button */}
      <div className="block sm:hidden mb-4">
        <AppButton
          onClick={handleAddProperty}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-colors duration-200"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </AppButton>
      </div>

      {/* Portfolio summary metrics strip */}
      <AppCard className="overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            icon={<Building className="w-4 h-4 text-gray-600" />}
            label="Properties"
            value={totalProperties}
          />
          <MetricCard
            icon={<DollarSign className="w-4 h-4 text-gray-600" />}
            label="Total Value"
            value={`$${totalValue.toFixed(1)}M`}
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4 text-gray-600" />}
            label="Avg Cap Rate"
            value={`${avgCapRate.toFixed(1)}%`}
          />
          <MetricCard
            icon={<BarChart3 className="w-4 h-4 text-gray-600" />}
            label="Total Units"
            value={totalUnits.toLocaleString()}
          />
        </div>
      </AppCard>

      {/* Main layout: Sidebar (25%) + Properties area (75%) */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left sidebar - Use cases and analysis tools */}
        <div className="w-full lg:w-1/4 space-y-3">
          {/* Document Analysis use case card */}
          <AppCard hover className="cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-gray-900">Document Analysis</h4>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">Extract data from rent rolls, OM, and financial statements</p>
            <AppButton variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-xs">
              View Analysis →
            </AppButton>
          </AppCard>

          {/* Financial Modeling use case card */}
          <AppCard hover className="cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                <Calculator className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-gray-900">Financial Modeling</h4>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">Build pro formas and compare returns across portfolio</p>
            <AppButton variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-xs">
              Run Models →
            </AppButton>
          </AppCard>

          {/* Portfolio Reports use case card */}
          <AppCard hover className="cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                <PieChart className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-gray-900">Portfolio Reports</h4>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">Generate custom insights and investor presentations</p>
            <AppButton variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-xs">
              Create Report →
            </AppButton>
          </AppCard>
        </div>

        {/* Right main area - Properties display */}
        <div className="w-full lg:w-3/4 space-y-4">
          {/* Search and view mode controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Search input with icon */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white shadow-sm font-medium placeholder:text-gray-400"
              />
            </div>
            {/* View mode toggle buttons */}
            <div className="flex items-center gap-2">
              <ViewModeButton mode="card" icon={<Grid3X3 className="w-4 h-4" />} label="Cards" />
              <ViewModeButton mode="list" icon={<List className="w-4 h-4" />} label="List" />
              <ViewModeButton mode="map" icon={<Map className="w-4 h-4" />} label="Map" />
            </div>
          </div>

          {/* Card view mode - Grid layout with property cards */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Add Property Card - Always first */}
              <AppCard
                onClick={handleAddProperty}
                className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 cursor-pointer group min-h-[200px] flex items-center justify-center"
              >
                <div className="text-center p-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-300 transition-colors">
                    <Plus className="w-5 h-5 text-gray-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 mb-1">Add Property</h3>
                  <p className="text-xs text-gray-500">Start tracking a new investment</p>
                </div>
              </AppCard>

              {/* Property cards with hover effects and dropdown menus */}
              {properties.map((property) => (
                <div
                  key={property.id}
                  onClick={(e) => handlePropertyClick(property.id, e)}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
                >
                  {/* Property actions dropdown */}
                  <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => handleEditProperty(property.id, e)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteProperty(property.id, e)}
                          className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Property
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Property image with hover zoom effect */}
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={property.thumbnail || "/placeholder.svg?height=150&width=250&query=apartment building"}
                      alt={`${property.name} exterior view`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Property details section */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs px-2 py-1">
                        {property.status}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{property.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {property.address}
                    </p>
                    {/* Property metrics grid */}
                    <div className="grid grid-cols-3 gap-1">
                      <div className="bg-gray-50 rounded-md p-1.5">
                        <div className="text-xs font-medium text-gray-600 mb-0.5">Price</div>
                        <div className="text-xs font-bold text-gray-900">{property.offerPrice}</div>
                      </div>
                      <div className="bg-gray-50 rounded-md p-1.5">
                        <div className="text-xs font-medium text-gray-600 mb-0.5">Cap Rate</div>
                        <div className="text-xs font-bold text-gray-900">{property.capRate}</div>
                      </div>
                      <div className="bg-gray-50 rounded-md p-1.5">
                        <div className="text-xs font-medium text-gray-600 mb-0.5">Units</div>
                        <div className="text-xs font-bold text-gray-900">{property.units}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List view mode - Table-like layout */}
          {viewMode === "list" && (
            <AppCard className="bg-white rounded-2xl shadow-lg border-2 border-white">
              <div className="p-0">
                {/* Add Property List Item - Always first */}
                <div
                  onClick={handleAddProperty}
                  className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer group border-2 border-dashed border-gray-200 bg-gray-50"
                >
                  <div className="w-12 h-8 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                    <Plus className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-700">Add New Property</h3>
                    <p className="text-xs text-gray-500">Start tracking a new investment opportunity</p>
                  </div>
                </div>

                {/* Property list items */}
                <div className="divide-y divide-gray-100">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={(e) => handlePropertyClick(property.id, e)}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer group relative"
                    >
                      {/* Property thumbnail */}
                      <div className="w-12 h-8 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={property.thumbnail || "/placeholder.svg?height=32&width=48&query=apartment building"}
                          alt={`${property.name} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Property information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xs font-semibold text-gray-900 truncate">{property.name}</h3>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                            {property.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 truncate mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {property.address}
                        </p>
                        {/* Property metrics inline */}
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Price: </span>
                            <span className="font-medium text-gray-900">{property.offerPrice}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cap: </span>
                            <span className="font-medium text-gray-900">{property.capRate}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Units: </span>
                            <span className="font-medium text-gray-900">{property.units}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions dropdown */}
                      <div className="flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={(e) => handleEditProperty(property.id, e)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Property
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteProperty(property.id, e)}
                              className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Property
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AppCard>
          )}

          {/* Map view mode - Interactive property map */}
          {viewMode === "map" && (
            <AppCard className="bg-white rounded-2xl shadow-lg border-2 border-white">
              <PropertyMap
                properties={properties}
                onPropertyClick={(propertyId) => handlePropertyClick(propertyId, {} as React.MouseEvent)}
              />
            </AppCard>
          )}
        </div>
      </div>
    </div>
  )
}
