"use client"

/**
 * Real Estate Investment Analyzer - Main Application Component
 *
 * This is the core component of the real estate investment analysis application.
 * It manages the overall application state, navigation between different analysis
 * tabs, property selection, and coordinates all the sub-components.
 *
 * Key Features:
 * - Multi-property analysis with tabbed interface
 * - Dynamic navigation based on property selection
 * - Property-specific analysis tools (Pro Forma, Returns, etc.)
 * - Responsive design for all screen sizes
 * - State management for active properties and tabs
 *
 * Architecture:
 * - Uses React hooks for state management
 * - Implements callback patterns for child component communication
 * - Modular tab system for different analysis views
 * - Property data integration through utility functions
 *
 * @file components/real-estate-analyzer.tsx
 * @author Real Estate Analyzer Team
 * @version 1.0.0
 */

import { useState, useCallback } from "react"
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
import { HomeTab } from "@/components/tabs/home-tab"
import { SummaryTab } from "@/components/tabs/summary-tab"
import { UnderwritingGraphsTab } from "@/components/tabs/analytics-tab"
import { PropertyTab } from "@/components/tabs/property-tab"
import { ReturnsTab } from "@/components/tabs/returns-tab"
import { ProFormaTab } from "@/components/tabs/pro-forma-tab"
import { PlanTab } from "@/components/tabs/plan-tab"
import { OutlayTab } from "@/components/tabs/outlay-tab"
import { CapitalTab } from "@/components/tabs/capital-tab"
import { getPropertyById } from "@/lib/property-data"
import { DocumentsTab } from "@/components/tabs/docs-tab/docs-tab"
import { T12ActualsTab } from "@/components/tabs/docs-tab/t12-actuals-tab"

/**
 * Navigation Item Interface
 *
 * Defines the structure for navigation menu items including
 * unique identifier, display label, and associated icon.
 */
interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
}

/**
 * Home Section Navigation Items
 *
 * Contains the main home/portfolio overview navigation item.
 * This section is always accessible regardless of property selection.
 */
const HOME_SECTION: NavigationItem[] = [{ id: "home", label: "Home", icon: <Home className="w-5 h-5" /> }]

/**
 * Property Analysis Navigation Items
 *
 * Contains all property-specific analysis tools and views.
 * These items are only fully functional when a property is selected.
 *
 * Sections include:
 * - Documents: Property documentation and files
 * - Property: Basic property information and details
 * - Pro Forma: Financial projections and analysis
 * - Capital: Debt assumptions and financing terms
 * - Plan: Business plan and strategy
 * - Outlay: Sources and uses of funds
 * - Returns: Investment return calculations
 * - Analytics: Charts and graphical analysis
 * - Summary: Comprehensive overview of all analysis
 */
const PROPERTY_SECTIONS: NavigationItem[] = [
  { id: "documents", label: "Docs", icon: <FileText className="w-5 h-5" /> },
  { id: "property", label: "Property", icon: <Building className="w-5 h-5" /> },
  {
    id: "pro-forma",
    label: "Pro Forma",
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    id: "debt-assumptions",
    label: "Capital",
    icon: <FileX className="w-5 h-5" />,
  },
  {
    id: "business-plan",
    label: "Plan",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: "sources-uses",
    label: "Outlay",
    icon: <ArrowLeftRight className="w-5 h-5" />,
  },
  { id: "returns", label: "Returns", icon: <TrendingUp className="w-5 h-5" /> },
  {
    id: "underwriting-graphs",
    label: "Analytics",
    icon: <BarChart className="w-5 h-5" />,
  },
  {
    id: "summary",
    label: "Summary",
    icon: <FileBarChart className="w-5 h-5" />,
  },
]

/**
 * Placeholder Tab Component
 *
 * A simple placeholder component used for tabs that don't have
 * full implementation yet. Displays a coming soon message.
 *
 * @param {Object} props - Component properties
 * @param {string} props.title - The title to display in the placeholder
 * @returns {JSX.Element} A placeholder tab content
 */
function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-6 sm:p-6 lg:p-8 text-center">
      <h2 className="text-xl sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-4">{title}</h2>
      <p className="text-base sm:text-base text-gray-600">Content for {title} coming soon.</p>
    </div>
  )
}

/**
 * Investment App - Main Application Component
 *
 * The primary component that orchestrates the entire real estate investment
 * analysis application. Manages state for active properties, open tabs,
 * navigation, and renders the appropriate content based on user selections.
 *
 * State Management:
 * - activeTab: Currently selected navigation tab
 * - activePropertyId: ID of the currently active property
 * - openPropertyTabs: Set of property IDs that have open tabs
 *
 * Key Behaviors:
 * - Property selection enables access to analysis tools
 * - Navigation validation ensures property is selected for property-specific tabs
 * - Multi-property support with tab management
 * - Responsive design across all screen sizes
 *
 * @returns {JSX.Element} The complete investment analysis application
 */
function InvestmentApp() {
  /** Current active navigation tab ID */
  const [activeTab, setActiveTab] = useState("home")

  /** ID of the currently active/selected property */
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null)

  /** Set of property IDs that have open tabs for multi-property analysis */
  const [openPropertyTabs, setOpenPropertyTabs] = useState<Set<string>>(new Set())
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const activeProperty = activePropertyId ? getPropertyById(activePropertyId) : null

  /**
   * Handle Property Edit Action
   *
   * Called when a user wants to edit/analyze a property. Opens the property
   * in a new tab, sets it as active, and navigates to the documents section.
   *
   * @param {string} propertyId - The ID of the property to edit
   */
  const handlePropertyEdit = useCallback((propertyId: string) => {
    // Add property to open tabs set
    setOpenPropertyTabs((prev) => new Set([...prev, propertyId]))
    // Set as active property
    setActivePropertyId(propertyId)
    // Navigate to documents tab as default starting point
    setActiveTab("documents")
  }, [])

  /**
   * Handle Property Close Action
   *
   * Closes a property tab and manages the active state. If the closed
   * property was active, switches to another open property or returns
   * to the home tab if no properties remain open.
   *
   * @param {string} propertyId - The ID of the property to close
   */
  const handlePropertyClose = useCallback(
    (propertyId: string) => {
      setOpenPropertyTabs((prev) => {
        const newTabs = new Set(prev)
        newTabs.delete(propertyId)

        // If closing the active property, switch to another or go home
        if (activePropertyId === propertyId) {
          const remainingTabs = Array.from(newTabs)
          if (remainingTabs.length > 0) {
            // Switch to the last remaining property
            const lastPropertyId = remainingTabs[remainingTabs.length - 1]
            setActivePropertyId(lastPropertyId)
            setActiveTab("documents")
          } else {
            // No properties left, return to home
            setActivePropertyId(null)
            setActiveTab("home")
          }
        }

        return newTabs
      })
    },
    [activePropertyId],
  )

  /**
   * Handle Property Focus Action
   *
   * Sets a property as the active property. If no property was previously
   * active, automatically navigates to the documents tab.
   *
   * @param {string} propertyId - The ID of the property to focus on
   */
  const handlePropertyFocus = useCallback(
    (propertyId: string) => {
      const wasNoPropertyActive = !activePropertyId
      setActivePropertyId(propertyId)

      // If switching from no property to a property, go to documents
      if (wasNoPropertyActive) {
        setActiveTab("documents")
      }
    },
    [activePropertyId],
  )

  /**
   * Handle Navigation Click
   *
   * Manages navigation between different tabs with validation.
   * Ensures that property-specific tabs are only accessible when
   * a property is selected, otherwise shows an alert.
   *
   * @param {string} tabId - The ID of the tab to navigate to
   */
  const handleNavigationClick = useCallback(
    (tabId: string) => {
      if (tabId === "home") {
        // Home tab is always accessible
        setActivePropertyId(null)
        setActiveTab("home")
      } else {
        // Property-specific tabs require a selected property
        if (activePropertyId) {
          setActiveTab(tabId)
        } else {
          // Show user-friendly alert when no property is selected
          alert(
            "Property Required\n\nPlease select a property from the Home tab or create a new property to access this analysis tool.",
          )
        }
      }
    },
    [activePropertyId],
  )

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev)
    setIsNavCollapsed((prev) => !prev)
  }, [])

  /**
   * Render Tab Content
   *
   * Returns the appropriate component based on the currently active tab.
   * Each tab receives the active property data as props when applicable.
   *
   * @returns {JSX.Element} The content component for the active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab onPropertyEdit={handlePropertyEdit} />
      case "documents":
        return (
          <DocumentsTab property={activeProperty}>
            {activeProperty && <T12ActualsTab property={activeProperty} />}
          </DocumentsTab>
        )
      case "summary":
        return <SummaryTab property={activeProperty} />
      case "underwriting-graphs":
        return <UnderwritingGraphsTab property={activeProperty} />
      case "property":
        return <PropertyTab property={activeProperty} />
      case "business-plan":
        return <PlanTab property={activeProperty} />
      case "sources-uses":
        return <OutlayTab property={activeProperty} />
      case "debt-assumptions":
        return <CapitalTab property={activeProperty} />
      case "pro-forma":
        return <ProFormaTab property={activeProperty} />
      case "returns":
        return <ReturnsTab property={activeProperty} />
      default:
        return <PlaceholderTab title="Unknown Section" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <TabBar
        onPropertyClose={handlePropertyClose}
        onPropertyFocus={handlePropertyFocus}
        activePropertyName={activeProperty?.name}
        openPropertyIds={Array.from(openPropertyTabs)}
        activePropertyId={activePropertyId}
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
                        const isActive = activeTab === item.id

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
                        const isActive = activeTab === item.id && activePropertyId

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
                                !activePropertyId && item.id !== "home"
                                  ? "text-gray-500 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 rounded-md sm:rounded-lg lg:rounded-xl"
                                  : isActive
                                    ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl scale-105 rounded-md sm:rounded-lg lg:rounded-xl transform ring-2 ring-gray-400"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg hover:scale-102 rounded-md sm:rounded-lg lg:rounded-xl transform"
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
                                isActive
                                  ? "text-white"
                                  : !activePropertyId
                                    ? "text-gray-500"
                                    : "text-gray-700 group-hover:text-gray-900"
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

      <div className="p-2 sm:p-3 md:p-4 lg:p-5">{renderTabContent()}</div>
    </div>
  )
}

export default InvestmentApp

export { InvestmentApp }
