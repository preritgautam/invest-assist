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
import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { type PropertyData, getAllProperties, addProperty } from "@/lib/property-data"
import { AppCard, MetricCard } from "@/components/ui/app-card"
import { AppButton } from "@/components/ui/app-button"
import { AppIcon } from "@/components/ui/app-icons"
import { PropertyMap } from "@/components/features/property-map"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UploadDialog } from "@/components/features/property-upload/upload-dialog"
import { cacheProperties, getAllCachedProperties, clearPropertyCache, type DatabaseProperty } from "@/lib/property-cache"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Props interface for HomeTab component
 */
interface HomeTabProps {
  /** Callback function triggered when a property is selected for editing */
  onPropertyEdit?: (propertyId: string) => void
  /** Array of open property IDs for quick access */
  openPropertyIds?: string[]
}

/**
 * Available view modes for property display
 */
type ViewMode = "card" | "list" | "map"

/**
 * HomeTab Component - Main property portfolio dashboard
 *
 * Displays property portfolio with multiple view modes, search functionality,
 * comprehensive property management features, and quick access to open properties.
 */
export function HomeTab({ onPropertyEdit, openPropertyIds = [] }: HomeTabProps) {
  // State management for view mode, properties, and search
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  
  // Initialize with empty array - will be populated after API fetch
  const [properties, setProperties] = useState<PropertyData[]>([])
  
  // Always show loading initially while fetching from API
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch properties from database API on mount
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoadingProperties(true)
      try {
        const response = await fetch('/api/properties')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.properties) {
            // Cache and convert database properties using the shared cache
            const dbProperties = cacheProperties(data.properties as DatabaseProperty[])
            // Merge with mock data (mock data IDs won't conflict with UUIDs)
            const mockProperties = getAllProperties()
            setProperties([...dbProperties, ...mockProperties])
          } else {
            // No DB properties, use mock data only
            setProperties(getAllProperties())
          }
        } else {
          // API error, fall back to mock data
          setProperties(getAllProperties())
        }
      } catch (error) {
        console.error('[HomeTab] Error fetching properties:', error)
        // On error, fall back to mock data
        setProperties(getAllProperties())
      } finally {
        setIsLoadingProperties(false)
      }
    }
    fetchProperties()
  }, [])

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
   * Refreshes property list to show newly created property
   */
  const handleUploadComplete = async (files: any[], propertyId?: string) => {
    console.log("[HomeTab] Upload complete with files:", files, "propertyId:", propertyId)
    // Refresh properties list from API to include newly created property
    try {
      const response = await fetch('/api/properties')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.properties) {
          // Cache and convert database properties
          const dbProperties = cacheProperties(data.properties as DatabaseProperty[])
          const mockProperties = getAllProperties()
          setProperties([...dbProperties, ...mockProperties])
        }
      }
    } catch (error) {
      console.error('[HomeTab] Error refreshing properties:', error)
    }
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
   * Opens the delete confirmation dialog for a property
   */
  const handleDeleteProperty = (propertyId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const property = properties.find(p => p.id === propertyId)
    if (property) {
      setPropertyToDelete(property)
      setDeleteDialogOpen(true)
    }
  }

  /**
   * Confirms and executes the property deletion
   */
  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return

    setIsDeleting(true)
    try {
      // Check if it's a mock property (mock IDs don't look like UUIDs)
      const isMockProperty = !propertyToDelete.id.includes('-') || propertyToDelete.id.length < 30

      if (isMockProperty) {
        // For mock properties, just remove from local state
        setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id))
        console.log('[HomeTab] Removed mock property from local state:', propertyToDelete.id)
      } else {
        // For database properties, call the API
        const response = await fetch(`/api/properties/${propertyToDelete.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete property')
        }

        // Clear the cache since we modified data
        clearPropertyCache()
        
        // Remove from local state
        setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id))
        console.log('[HomeTab] Property deleted successfully:', propertyToDelete.id)
      }
    } catch (error) {
      console.error('[HomeTab] Error deleting property:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete property')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
    }
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
   * Skeleton loader for property cards
   */
  const PropertyCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="h-36 w-full" />
      <div className="p-4 space-y-3">
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-20 rounded-full" />
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />
        {/* Address skeleton */}
        <Skeleton className="h-4 w-full" />
        {/* Metrics skeleton */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      </div>
    </div>
  )

  /**
   * Skeleton loader for property list rows
   */
  const PropertyListSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-24 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-6">
          <div className="space-y-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </div>
    </div>
  )

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

  console.log("properties", properties, "isLoadingProperties", isLoadingProperties)

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <UploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onComplete={handleUploadComplete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{propertyToDelete?.name}</span>?
              This action cannot be undone. All associated documents and data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPropertyToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProperty}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Property
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            value={totalUnits.toLocaleString('en-US')}
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

              {/* Skeleton loaders while fetching */}
              {isLoadingProperties && (
                <>
                  <PropertyCardSkeleton />
                  <PropertyCardSkeleton />
                  <PropertyCardSkeleton />
                  <PropertyCardSkeleton />
                  <PropertyCardSkeleton />
                </>
              )}

              {/* Property cards with hover effects and dropdown menus */}
              {!isLoadingProperties && properties.map((property) => (
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
                  {/* Skeleton loaders while fetching */}
                  {isLoadingProperties && (
                    <>
                      <PropertyListSkeleton />
                      <PropertyListSkeleton />
                      <PropertyListSkeleton />
                      <PropertyListSkeleton />
                      <PropertyListSkeleton />
                    </>
                  )}

                  {!isLoadingProperties && properties.map((property) => (
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
                activeProperty={null}
                onPropertySelect={(property) => handlePropertyClick(property.id, {} as React.MouseEvent)}
              />
            </AppCard>
          )}
        </div>
      </div>
    </div>
  )
}
