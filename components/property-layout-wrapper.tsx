"use client"

/**
 * Property Layout Wrapper
 *
 * This component provides a consistent layout for all property pages,
 * including the TabBar and Navigation sections. It maintains the design
 * across all property-related pages.
 *
 * @file components/property-layout-wrapper.tsx
 */

import { useState, useCallback, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"
import {
  Home,
  FileBarChart,
  Building,
  TrendingUp,
  ArrowLeftRight,
  Calculator,
  FileX,
  Briefcase,
  BarChart,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { TabBar } from "@/components/tab-bar"
import { getPropertyById } from "@/lib/property-data"

/**
 * Navigation Item Interface
 */
interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

/**
 * Home Section Navigation Items
 */
const HOME_SECTION: NavigationItem[] = [
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" />, path: "/" },
]

/**
 * Property Analysis Navigation Items
 */
const PROPERTY_SECTIONS: NavigationItem[] = [
  { id: "documents", label: "Docs", icon: <FileText className="w-5 h-5" />, path: "/documents" },
  { id: "property", label: "Property", icon: <Building className="w-5 h-5" />, path: "/property" },
  {
    id: "pro-forma",
    label: "Pro Forma",
    icon: <Calculator className="w-5 h-5" />,
    path: "/pro-forma",
  },
  {
    id: "debt-assumptions",
    label: "Capital",
    icon: <FileX className="w-5 h-5" />,
    path: "/capital",
  },
  {
    id: "business-plan",
    label: "Plan",
    icon: <Briefcase className="w-5 h-5" />,
    path: "/plan",
  },
  {
    id: "sources-uses",
    label: "Outlay",
    icon: <ArrowLeftRight className="w-5 h-5" />,
    path: "/outlay",
  },
  { id: "returns", label: "Returns", icon: <TrendingUp className="w-5 h-5" />, path: "/returns" },
  {
    id: "underwriting-graphs",
    label: "Analytics",
    icon: <BarChart className="w-5 h-5" />,
    path: "/analytics",
  },
  {
    id: "summary",
    label: "Summary",
    icon: <FileBarChart className="w-5 h-5" />,
    path: "/summary",
  },
]

interface PropertyLayoutWrapperProps {
  propertyId: string
  children: React.ReactNode
  currentTab?: string
}

/**
 * Property Layout Wrapper Component
 *
 * Wraps all property pages with consistent navigation and TabBar
 * Uses URL-based routing to maintain state across page refreshes
 */
export function PropertyLayoutWrapper({
  propertyId,
  children,
  currentTab = "documents",
}: PropertyLayoutWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [openPropertyIds, setOpenPropertyIds] = useState<string[]>([])

  const activeProperty = getPropertyById(propertyId)

  // Load and manage open properties from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem("openPropertyIds")
    if (saved) {
      try {
        const ids = JSON.parse(saved)
        // Add current property if not already in list
        if (!ids.includes(propertyId)) {
          const updated = [...ids, propertyId]
          setOpenPropertyIds(updated)
          sessionStorage.setItem("openPropertyIds", JSON.stringify(updated))
        } else {
          setOpenPropertyIds(ids)
        }
      } catch (e) {
        setOpenPropertyIds([propertyId])
      }
    } else {
      setOpenPropertyIds([propertyId])
      sessionStorage.setItem("openPropertyIds", JSON.stringify([propertyId]))
    }
  }, [propertyId])

  /**
   * Handle Property Close Action
   */
const handlePropertyClose = useCallback(
    (closingPropertyId: string) => {
      // Update openPropertyIds (pure updater)
      setOpenPropertyIds((prev) => {
        const newIds = prev.filter((id) => id !== closingPropertyId)
        sessionStorage.setItem("openPropertyIds", JSON.stringify(newIds))
        return newIds
      })

      // Perform navigation as a side-effect AFTER state update to avoid
      // "Cannot update a component while rendering a different component" warning.
      if (closingPropertyId === propertyId) {
        // Use next tick so this navigation doesn't run during render.
        // setTimeout 0 is sufficient and safe here.
        setTimeout(() => {
          router.push("/")
        }, 0)
      }
    },
    [propertyId, router],
  )

  /**
   * Handle Navigation Click
   */
  const handleNavigationClick = useCallback(
    (tabId: string) => {
      if (tabId === "home") {
        router.push("/")
      } else {
        const navItem = PROPERTY_SECTIONS.find((item) => item.id === tabId)
        if (navItem && activeProperty) {
          router.push(`/properties/${propertyId}${navItem.path}`)
        }
      }
    },
    [propertyId, activeProperty, router],
  )

  if (!activeProperty) {
    console.warn(
      `[PropertyLayoutWrapper] Property not found for ID: "${propertyId}". ` +
      `This usually means the property ID is incorrect or the property doesn't exist in the database.`
    )
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
          <p className="text-gray-600 mt-2">The property you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mt-4">Property ID: {propertyId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <TabBar
        onPropertyClose={handlePropertyClose}
        onPropertyFocus={(id) => router.push(`/properties/${id}/documents`)}
        activePropertyName={activeProperty?.name}
        openPropertyIds={openPropertyIds}
        activePropertyId={propertyId}
        activeProperty={activeProperty}
        onNavigationClick={handleNavigationClick}
      />

      {!isFullscreen && (
        <div className="sticky top-11 z-40 bg-gray-100 border-b border-gray-200 transition-all duration-300 ease-in-out">
          {/* Collapse/Expand Toggle Button */}
          <div className="flex items-center justify-center py-1 bg-white/50 backdrop-blur-sm">
            <button
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              className="flex items-center gap-2 px-4 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-all duration-200"
              title={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {isNavCollapsed ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show Navigation</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Navigation</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Bar - Collapsible */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isNavCollapsed ? "max-h-0 opacity-0" : "max-h-32 opacity-100"
            }`}
          >
            <div className="p-1 sm:p-1.5 md:p-2">
              <div className="flex items-center">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border sm:border-2 md:border-4 border-white p-0.5 sm:p-1 w-full">
                  <nav className="bg-gradient-to-br from-gray-50 via-gray-100/80 to-gray-200/60 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 w-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.06),inset_0_-2px_4px_rgba(255,255,255,0.8)] border border-gray-200/30 backdrop-blur-sm relative before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/20 before:to-transparent before:rounded-xl sm:before:rounded-2xl before:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-white/10 after:rounded-xl sm:after:rounded-2xl after:pointer-events-none">
                    <div className="flex items-center justify-between overflow-x-auto scrollbar-hide px-0.5 pb-0.5 sm:pb-0">
                      {HOME_SECTION.map((item) => {
                        const isActive = currentTab === item.id

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigationClick(item.id)}
                            className={`
                              group relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 
                              px-2 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5
                              min-w-[60px] sm:min-w-[70px] md:min-w-[80px] lg:min-w-[90px]
                              min-h-[50px] sm:min-h-[55px] md:min-h-[60px]
                              transition-all duration-300 ease-out flex-shrink-0
                              ${
                                isActive
                                  ? "text-white rounded-lg sm:rounded-xl lg:rounded-2xl transform relative"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg hover:scale-102 rounded-lg sm:rounded-xl lg:rounded-2xl transform"
                              }
                            `}
                          >
                            {isActive && (
                              <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md sm:rounded-lg lg:rounded-xl shadow-xl z-0" />
                            )}

                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 relative z-10 ${
                                isActive ? "scale-110" : "group-hover:scale-110"
                              }`}
                            >
                              {item.icon}
                            </div>

                            <span
                              className={`font-bold text-center leading-tight transition-all duration-300 text-[10px] sm:text-xs md:text-xs lg:text-sm relative z-10 ${
                                isActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {item.label}
                            </span>
                          </button>
                        )
                      })}

                      <div className="flex items-center px-0.5 md:px-1 lg:px-1 flex-shrink-0">
                        <div className="w-px h-5 sm:h-8 md:h-9 lg:h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                        <div className="hidden md:flex items-center mx-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-0.5"></div>
                          <div className="w-1 h-1 rounded-full bg-gray-400 mx-0.5"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-0.5"></div>
                        </div>
                        <div className="w-px h-5 sm:h-8 md:h-9 lg:h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                      </div>

                      {PROPERTY_SECTIONS.map((item) => {
                        const isActive = currentTab === item.id

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigationClick(item.id)}
                            className={`
                              group relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 
                              px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-1.5 sm:py-2 md:py-2.5 lg:py-3
                              min-w-[50px] sm:min-w-[60px] md:min-w-[65px] lg:min-w-[70px]
                              min-h-[45px] sm:min-h-[50px] md:min-h-[55px]
                              transition-all duration-300 ease-out flex-shrink-0  
                              ${
                                isActive
                                  ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl scale-105 rounded-md sm:rounded-lg lg:rounded-xl transform ring-2 ring-gray-400"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg hover:scale-102 rounded-md sm:rounded-lg lg:rounded-xl transform border border-black/10"
                              }
                            `}
                          >
                            <div
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 flex items-center justify-center flex-shrink-0 transition-transform duration-300 relative z-10 ${
                                isActive ? "scale-110" : "group-hover:scale-110"
                              }`}
                            >
                              {item.icon}
                            </div>

                            <span
                              className={`font-semibold text-center leading-tight transition-all duration-300 text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs relative z-10 ${
                                isActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {item.label}
                            </span>

                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md sm:rounded-lg lg:rounded-xl shadow-xl -z-10" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 sm:p-3 md:p-4 lg:p-5">{children}</div>
    </div>
  )
}
