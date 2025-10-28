"use client";

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

import { useState, useCallback } from "react";
import type React from "react";
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
} from "lucide-react";
import { TabBar } from "@/components/tab-bar";
import { HomeTab } from "@/components/features/property-analysis/home-tab";
import { SummaryTab } from "@/components/features/property-analysis/summary-tab";
import { UnderwritingGraphsTab } from "@/components/tabs/analytics-tab";
import { PropertyTab } from "@/components/features/property-analysis/property-tab";
import { ReturnsTab } from "@/components/features/property-analysis/returns-tab";
import { ProFormaTab } from "@/components/features/property-analysis/pro-forma-tab";
import { PlanTab } from "@/components/tabs/plan-tab";
import { OutlayTab } from "@/components/tabs/outlay-tab";
import { CapitalTab } from "@/components/tabs/capital-tab";
import { getPropertyById } from "@/lib/property-data";
import { DocumentsTab } from "@/components/tabs/docs-tab";

/**
 * Navigation Item Interface
 *
 * Defines the structure for navigation menu items including
 * unique identifier, display label, and associated icon.
 */
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Home Section Navigation Items
 *
 * Contains the main home/portfolio overview navigation item.
 * This section is always accessible regardless of property selection.
 */
const HOME_SECTION: NavigationItem[] = [
  { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
];

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
];

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
      <h2 className="text-xl sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-4">
        {title}
      </h2>
      <p className="text-base sm:text-base text-gray-600">
        Content for {title} coming soon.
      </p>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState("home");

  /** ID of the currently active/selected property */
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  /** Set of property IDs that have open tabs for multi-property analysis */
  const [openPropertyTabs, setOpenPropertyTabs] = useState<Set<string>>(
    new Set()
  );

  /** Get the active property object from the property data */
  const activeProperty = activePropertyId
    ? getPropertyById(activePropertyId)
    : null;

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
    setOpenPropertyTabs((prev) => new Set([...prev, propertyId]));
    // Set as active property
    setActivePropertyId(propertyId);
    // Navigate to documents tab as default starting point
    setActiveTab("documents");
  }, []);

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
        const newTabs = new Set(prev);
        newTabs.delete(propertyId);

        // If closing the active property, switch to another or go home
        if (activePropertyId === propertyId) {
          const remainingTabs = Array.from(newTabs);
          if (remainingTabs.length > 0) {
            // Switch to the last remaining property
            const lastPropertyId = remainingTabs[remainingTabs.length - 1];
            setActivePropertyId(lastPropertyId);
            setActiveTab("documents");
          } else {
            // No properties left, return to home
            setActivePropertyId(null);
            setActiveTab("home");
          }
        }

        return newTabs;
      });
    },
    [activePropertyId]
  );

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
      const wasNoPropertyActive = !activePropertyId;
      setActivePropertyId(propertyId);

      // If switching from no property to a property, go to documents
      if (wasNoPropertyActive) {
        setActiveTab("documents");
      }
    },
    [activePropertyId]
  );

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
        setActivePropertyId(null);
        setActiveTab("home");
      } else {
        // Property-specific tabs require a selected property
        if (activePropertyId) {
          setActiveTab(tabId);
        } else {
          // Show user-friendly alert when no property is selected
          alert(
            "Property Required\n\nPlease select a property from the Home tab or create a new property to access this analysis tool."
          );
        }
      }
    },
    [activePropertyId]
  );

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
        return <HomeTab onPropertyEdit={handlePropertyEdit} />;
      case "summary":
        return <SummaryTab property={activeProperty} />;
      case "underwriting-graphs":
        return <UnderwritingGraphsTab property={activeProperty} />;
      case "property":
        return <PropertyTab property={activeProperty} />;
      case "documents":
        return <DocumentsTab property={activeProperty} />;
      case "business-plan":
        return <PlanTab property={activeProperty} />;
      case "sources-uses":
        return <OutlayTab property={activeProperty} />;
      case "debt-assumptions":
        return <CapitalTab property={activeProperty} />;
      case "pro-forma":
        return <ProFormaTab property={activeProperty} />;
      case "returns":
        return <ReturnsTab property={activeProperty} />;
      default:
        return <PlaceholderTab title="Unknown Section" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Property Tab Bar - Shows open properties and allows switching between them */}
      <TabBar
        onPropertyClose={handlePropertyClose}
        onPropertyFocus={handlePropertyFocus}
        activePropertyName={activeProperty?.name}
        openPropertyIds={Array.from(openPropertyTabs)}
        activePropertyId={activePropertyId}
      />

      <div className="sticky top-14 z-40 bg-gray-100 p-1 sm:p-2 md:p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-2xl sm:rounded-full shadow-xl border-2 sm:border-4 md:border-8 border-white p-1 sm:p-2 max-w-7xl w-full">
            <nav className="bg-gradient-to-br from-gray-50 via-gray-100/80 to-gray-200/60 rounded-2xl sm:rounded-full p-1 sm:p-2 w-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.06),inset_0_-2px_4px_rgba(255,255,255,0.8)] border border-gray-200/30 backdrop-blur-sm relative before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/20 before:to-transparent before:rounded-2xl sm:before:rounded-full before:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-white/10 after:rounded-2xl sm:after:rounded-full after:pointer-events-none">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide justify-start sm:justify-center px-1 pb-1 sm:pb-0">
                {/* Home Section - Portfolio Overview */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {HOME_SECTION.map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigationClick(item.id)}
                        className={`
                          group relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 
                          px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 md:py-4 lg:py-5
                          min-w-[70px] sm:min-w-[80px] md:min-w-[90px] lg:min-w-[100px]
                          min-h-[60px] sm:min-h-[70px] md:min-h-[80px]
                          transition-all duration-300 ease-out flex-shrink-0
                          ${
                            isActive
                              ? "text-white rounded-xl sm:rounded-2xl lg:rounded-3xl transform relative"
                              : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg hover:scale-102 rounded-xl sm:rounded-2xl lg:rounded-3xl transform"
                          }
                        `}
                      >
                        {/* Active state background gradient */}
                        {isActive && (
                          <div className="absolute inset-1 sm:inset-2 bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl z-0" />
                        )}

                        {/* Icon with hover and active state scaling */}
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0 transition-transform duration-300 relative z-10 ${
                            isActive ? "scale-110" : "group-hover:scale-110"
                          }`}
                        >
                          {item.icon}
                        </div>

                        {/* Label with responsive text sizing */}
                        <span
                          className={`font-bold text-center leading-tight transition-all duration-300 text-xs sm:text-sm md:text-sm lg:text-sm relative z-10 ${
                            isActive
                              ? "text-white"
                              : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center px-1 md:px-2 lg:px-2 flex-shrink-0">
                  <div className="w-px h-6 sm:h-10 md:h-11 lg:h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                  <div className="hidden md:flex items-center mx-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400 mx-1"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
                  </div>
                  <div className="w-px h-6 sm:h-10 md:h-11 lg:h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                </div>

                {/* Property Analysis Section - Tools that require property selection */}
                <div className="flex items-center gap-1 sm:gap-2 md:gap-2 lg:gap-2 flex-shrink-0">
                  {PROPERTY_SECTIONS.map((item) => {
                    const isActive = activeTab === item.id && activePropertyId;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigationClick(item.id)}
                        className={`
                          group relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 
                          px-2 sm:px-3 md:px-3 lg:px-4 py-2.5 sm:py-3 md:py-3 lg:py-4
                          min-w-[60px] sm:min-w-[70px] md:min-w-[75px] lg:min-w-[80px]
                          min-h-[55px] sm:min-h-[65px] md:min-h-[70px]
                          transition-all duration-300 ease-out flex-shrink-0
                          ${
                            !activePropertyId && item.id !== "home"
                              ? "text-gray-500 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl"
                              : isActive
                              ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl scale-105 rounded-lg sm:rounded-xl lg:rounded-2xl transform ring-2 ring-gray-400"
                              : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg hover:scale-102 rounded-lg sm:rounded-xl lg:rounded-2xl transform"
                          }
                        `}
                      >
                        {/* Icon with conditional scaling based on state */}
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 relative z-10 ${
                            isActive ? "scale-110" : "group-hover:scale-110"
                          }`}
                        >
                          {item.icon}
                        </div>

                        {/* Label with conditional styling based on property selection */}
                        <span
                          className={`font-semibold text-center leading-tight transition-all duration-300 text-[10px] sm:text-xs md:text-xs lg:text-xs relative z-10 ${
                            isActive
                              ? "text-white"
                              : !activePropertyId
                              ? "text-gray-500"
                              : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {item.label}
                        </span>

                        {/* Active state background for property tabs */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl -z-10" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area - Renders the active tab's content */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">{renderTabContent()}</div>
    </div>
  );
}

/** Default export of the main Investment App component */
export default InvestmentApp;

/** Named export for explicit imports */
export { InvestmentApp };
