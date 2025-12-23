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
  ArrowUpRight,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { type PropertyData, getAllProperties, addProperty } from "@/lib/property-data"
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
    <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm">
      {/* Image skeleton */}
      <Skeleton className="h-44 w-full" />
      <div className="p-5 space-y-4">
        {/* Badge skeleton */}
        <Skeleton className="h-6 w-24 rounded-full" />
        {/* Title skeleton */}
        <Skeleton className="h-5 w-4/5" />
        {/* Address skeleton */}
        <Skeleton className="h-4 w-full" />
        {/* Metrics skeleton */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    </div>
  )

  /**
   * Skeleton loader for property list rows
   */
  const PropertyListSkeleton = () => (
    <div className="flex items-center gap-5 p-5">
      <Skeleton className="h-20 w-28 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-72" />
        <div className="flex gap-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
  )

  /**
   * Reusable view mode button component
   * Handles active state styling and click events
   */
  const ViewModeButton = ({ mode, icon, label }: { mode: ViewMode; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        viewMode === mode 
          ? "bg-gray-900 text-white shadow-md" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/80"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  console.log("properties", properties, "isLoadingProperties", isLoadingProperties)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-slate-100/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <UploadDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onComplete={handleUploadComplete}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Delete Property</DialogTitle>
              <DialogDescription className="text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-700">{propertyToDelete?.name}</span>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setPropertyToDelete(null)
                }}
                disabled={isDeleting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteProperty}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 rounded-xl"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Portfolio Overview</h1>
            <p className="text-gray-500 mt-1">Manage and analyze your investment properties</p>
          </div>
          <button
            onClick={handleAddProperty}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/15 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
        </div>

        {/* Portfolio Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Properties</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalProperties}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">${totalValue.toFixed(1)}M</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-violet-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">Avg Cap Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{avgCapRate.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">Total Units</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalUnits.toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Document Analysis</p>
                      <p className="text-xs text-gray-500">Extract rent roll data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Calculator className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Financial Models</p>
                      <p className="text-xs text-gray-500">Build pro formas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <PieChart className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Reports</p>
                      <p className="text-xs text-gray-500">Generate insights</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            {/* Recent Activity - Only show on larger screens */}
            <div className="hidden xl:block bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
              <h3 className="text-sm font-semibold mb-3">Pro Tip</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Upload rent rolls and operating statements to automatically extract and analyze property data.
              </p>
              <button className="mt-4 text-sm font-medium text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                Learn more <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Properties Area */}
          <div className="xl:col-span-3 space-y-4">
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 placeholder:text-gray-400 transition-all duration-200"
                />
              </div>
              <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl">
                <ViewModeButton mode="card" icon={<Grid3X3 className="w-4 h-4" />} label="Cards" />
                <ViewModeButton mode="list" icon={<List className="w-4 h-4" />} label="List" />
                <ViewModeButton mode="map" icon={<Map className="w-4 h-4" />} label="Map" />
              </div>
            </div>

            {/* Card view mode - Grid layout with property cards */}
            {viewMode === "card" && (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                {/* Add Property Card - Always first */}
                <button
                  onClick={handleAddProperty}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-white transition-all duration-200 cursor-pointer group min-h-[280px] flex flex-col items-center justify-center p-6"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-gray-200 group-hover:scale-105 transition-all duration-200">
                    <Plus className="w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Add Property</h3>
                  <p className="text-sm text-gray-500 text-center">Upload documents to start analysis</p>
                </button>

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
                    className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group relative"
                  >
                    {/* Property actions dropdown */}
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-100"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl">
                          <DropdownMenuItem
                            onClick={(e) => handleEditProperty(property.id, e)}
                            className="flex items-center gap-2 cursor-pointer rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteProperty(property.id, e)}
                            className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Property image with hover zoom effect */}
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      <img
                        src={property.thumbnail || "/placeholder.svg?height=150&width=250&query=apartment building"}
                        alt={`${property.name} exterior view`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Property details section */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 font-medium rounded-full hover:bg-gray-100">
                          {property.status}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1">{property.name}</h3>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {property.address}
                      </p>
                      {/* Property metrics grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-0.5">Price</p>
                          <p className="text-sm font-semibold text-gray-900">{property.offerPrice}</p>
                        </div>
                        <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-0.5">Cap Rate</p>
                          <p className="text-sm font-semibold text-gray-900">{property.capRate}</p>
                        </div>
                        <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-0.5">Units</p>
                          <p className="text-sm font-semibold text-gray-900">{property.units}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List view mode - Table-like layout */}
            {viewMode === "list" && (
              <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                {/* Add Property List Item - Always first */}
                <button
                  onClick={handleAddProperty}
                  className="w-full flex items-center gap-5 p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer group bg-gray-50/50"
                >
                  <div className="w-20 h-14 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Plus className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-gray-700">Add New Property</h3>
                    <p className="text-sm text-gray-500">Upload documents to start tracking</p>
                  </div>
                </button>

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
                      className="flex items-center gap-5 p-5 hover:bg-gray-50 transition-colors duration-200 cursor-pointer group relative"
                    >
                      {/* Property thumbnail */}
                      <div className="w-20 h-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img
                          src={property.thumbnail || "/placeholder.svg?height=32&width=48&query=apartment building"}
                          alt={`${property.name} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Property information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{property.name}</h3>
                          <Badge className="bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-100">
                            {property.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {property.address}
                        </p>
                      </div>

                      {/* Property metrics - desktop only */}
                      <div className="hidden lg:flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Price</p>
                          <p className="font-semibold text-gray-900">{property.offerPrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Cap Rate</p>
                          <p className="font-semibold text-gray-900">{property.capRate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Units</p>
                          <p className="font-semibold text-gray-900">{property.units}</p>
                        </div>
                      </div>

                      {/* Actions dropdown */}
                      <div className="flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2.5 rounded-xl hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl">
                            <DropdownMenuItem
                              onClick={(e) => handleEditProperty(property.id, e)}
                              className="flex items-center gap-2 cursor-pointer rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Property
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteProperty(property.id, e)}
                              className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 rounded-lg"
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
            )}

            {/* Map view mode - Interactive property map */}
            {viewMode === "map" && (
              <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                <PropertyMap
                  properties={properties}
                  activeProperty={null}
                  onPropertySelect={(property) => handlePropertyClick(property.id, {} as React.MouseEvent)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
