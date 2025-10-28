"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  Download,
  Share,
  Plus,
  Grid,
  X,
  MoreHorizontal,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  MessageSquare,
  Building,
  TrendingUp,
  Calculator,
  FileBarChart,
  FileText,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { UploadDialog } from "@/components/features/property-upload/upload-dialog"
import { type PropertyData, getAllProperties, addProperty } from "@/lib/property-data"

interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

/**
 * ClickAiApp Interface
 *
 * Defines the structure for Clik.ai application items in the app launcher
 */
interface ClickAiApp {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

interface TabBarProps {
  onPropertyClose?: (propertyId: string) => void
  onPropertyFocus?: (propertyId: string) => void
  activePropertyName?: string
  openPropertyIds?: string[]
  activePropertyId?: string | null
}

const ColorfulDotsIcon = () => (
  <div className="w-4 h-4 grid grid-cols-3 gap-0.5">
    {[
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-indigo-500",
    ].map((color, index) => (
      <div key={index} className={`w-1 h-1 ${color} rounded-full`} />
    ))}
  </div>
)

/**
 * User Profile Dropdown Component
 *
 * Displays user profile information and account management options
 */
function UserProfileDropdown({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  const menuItems = [
    { icon: Settings, label: "Settings" },
    { icon: CreditCard, label: "Billing" },
    { icon: HelpCircle, label: "Help" },
  ]

  return (
    <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-48">
      <div className="px-3 py-2 border-b border-gray-100 mb-1">
        <div className="text-sm font-medium text-gray-900">John Doe</div>
        <div className="text-xs text-gray-500">john.doe@example.com</div>
      </div>

      <div className="space-y-1">
        {menuItems.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-normal hover:bg-gray-50"
            onClick={onClose}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}

        <div className="border-t border-gray-100 mt-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-normal hover:bg-gray-50 text-red-600 hover:text-red-700"
            onClick={onClose}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * App Launcher Component
 *
 * Displays a grid of available Clik.ai applications that the user can launch
 */
function AppLauncher({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  // Define available Clik.ai applications
  const apps: ClickAiApp[] = [
    {
      id: "Invest Assist",
      name: "Invest Assist",
      icon: <Building className="w-5 h-5 text-blue-500" />,
      // description: "Analyze investment properties",
    },
    {
      id: "Analyze Cashflow",
      name: "Analyze Cashflow",
      icon: <Briefcase className="w-5 h-5 text-green-500" />,
      // description: "Manage your property portfolio",
    },
    {
      id: "Analyze Rent Roll",
      name: "Analyze Rent Roll",
      icon: <Calculator className="w-5 h-5 text-purple-500" />,
      // description: "Investment calculations",
    },
    {
      id: "Analyze OM",
      name: "Analyze OM",
      icon: <TrendingUp className="w-5 h-5 text-red-500" />,
      // description: "Real estate market analytics",
    },
    {
      id: "Lease Abstraction",
      name: "Lease Abstraction",
      icon: <FileText className="w-5 h-5 text-yellow-500" />,
      // description: "Property documentation",
    },
    {
      id: "Request Detailed Underwriting",
      name: "Request Detailed Underwriting",
      icon: <FileBarChart className="w-5 h-5 text-indigo-500" />,
      // description: "Generate investment reports",
    },
  ]

  return (
    <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-4 z-50 w-72 sm:w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Clik.ai Apps</h3>
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0 rounded-lg" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {apps.map((app) => (
          <div
            key={app.id}
            className="flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 border border-gray-200/50 hover:shadow-md"
            onClick={() => {
              // Handle app launching
              console.log(`Launching app: ${app.name}`)
              onClose()
            }}
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 shadow-sm">
              {app.icon}
            </div>
            <span className="text-xs font-semibold text-center text-gray-900">{app.name}</span>
            <span className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{app.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * TabBar Component
 *
 * Main navigation component that displays open properties and provides
 * access to app features, user profile, and property management
 */
export function TabBar({
  onPropertyClose,
  onPropertyFocus,
  activePropertyName,
  openPropertyIds = [],
  activePropertyId,
}: TabBarProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [showAppLauncher, setShowAppLauncher] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [showTabOverview, setShowTabOverview] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const refs = {
    tabOverview: useRef<HTMLDivElement>(null),
    appLauncher: useRef<HTMLDivElement>(null),
    userProfile: useRef<HTMLDivElement>(null),
  }

  useEffect(() => {
    const centralProperties = getAllProperties()
    const tabProperties: Property[] = openPropertyIds
      .map((id) => {
        const prop = centralProperties.find((p) => p.id === id)
        return prop
          ? {
              id: prop.id,
              name: prop.name,
              address: prop.address,
              isActive: activePropertyId === prop.id,
            }
          : null
      })
      .filter(Boolean) as Property[]

    console.log(
      "[v0] TabBar syncing properties:",
      tabProperties.map((p) => `${p.name}${p.isActive ? " (active)" : ""}`),
    )
    setProperties(tabProperties)
  }, [openPropertyIds, activePropertyId])

  const activeProperty = properties.find((p) => p.isActive)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (refs.tabOverview.current && !refs.tabOverview.current.contains(target)) {
        setShowTabOverview(false)
      }
      if (refs.appLauncher.current && !refs.appLauncher.current.contains(target)) {
        setShowAppLauncher(false)
      }
      if (refs.userProfile.current && !refs.userProfile.current.contains(target)) {
        setShowUserProfile(false)
      }
    }

    if (showTabOverview || showAppLauncher || showUserProfile) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showTabOverview, showAppLauncher, showUserProfile])

  const handlePropertySwitch = useCallback((propertyId: string) => {
    setProperties((prev) => prev.map((p) => ({ ...p, isActive: p.id === propertyId })))
  }, [])

  const handlePropertyFocus = useCallback(
    (propertyId: string) => {
      console.log("[v0] TabBar focusing property:", propertyId)
      onPropertyFocus?.(propertyId)
    },
    [onPropertyFocus],
  )

  const handleCloseProperty = useCallback(
    (propertyId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      console.log("[v0] TabBar closing property:", propertyId)
      onPropertyClose?.(propertyId)
    },
    [onPropertyClose],
  )

  const handleNewProperty = useCallback(() => {
    setShowUploadDialog(true)
  }, [])

  const handleUploadComplete = useCallback(
    (files: any[]) => {
      console.log("[v0] Upload complete with files:", files)
      const newProperty: PropertyData = {
        id: Date.now().toString(),
        name: `New Property ${properties.length + 1}`,
        address: "Address TBD",
        status: "Draft",
        thumbnail: "/modern-apartment-building.png",
        offerPrice: "$0.0M",
        capRate: "0.0%",
        units: 0,
      }
      addProperty(newProperty)

      const newTabProperty: Property = {
        id: newProperty.id,
        name: newProperty.name,
        address: newProperty.address,
        isActive: true,
      }
      setProperties((prev) => [...prev.map((p) => ({ ...p, isActive: false })), newTabProperty])

      onPropertyFocus?.(newProperty.id)
    },
    [properties.length, onPropertyFocus],
  )

  return (
    <TooltipProvider>
      <UploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onComplete={handleUploadComplete}
      />
      <div className="sticky top-0 z-50 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between h-12 sm:h-14 px-2 sm:px-3 md:px-6 gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 relative" ref={refs.appLauncher}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 sm:w-9 sm:h-9 p-0 hover:bg-gray-100/80 rounded-xl transition-all duration-200 flex items-center justify-center touch-manipulation"
                  onClick={() => setShowAppLauncher(!showAppLauncher)}
                >
                  <ColorfulDotsIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clik.ai Apps</p>
              </TooltipContent>
            </Tooltip>

            {/* App Launcher Component */}
            <AppLauncher isOpen={showAppLauncher} onClose={() => setShowAppLauncher(false)} />
          </div>

          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="hidden sm:flex items-center gap-1 w-full max-w-4xl overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`
                      group flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2 rounded-xl cursor-pointer transition-all duration-300 min-w-fit backdrop-blur-sm flex-shrink-0
                      ${
                        property.isActive
                          ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg shadow-gray-700/25 scale-105"
                          : "bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border border-gray-200/50"
                      }
                    `}
                    onClick={() => handlePropertyFocus(property.id)}
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span
                        className={`text-xs font-semibold truncate max-w-24 md:max-w-40 lg:max-w-44 ${
                          property.isActive ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {property.name}
                      </span>
                      <span
                        className={`text-xs truncate max-w-24 md:max-w-40 lg:max-w-44 ${
                          property.isActive ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {property.address}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-5 h-5 p-0 transition-all duration-200 rounded-lg flex-shrink-0 touch-manipulation ${
                        property.isActive
                          ? "hover:bg-white/20 text-gray-300 hover:text-white"
                          : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                      }`}
                      onClick={(e) => handleCloseProperty(property.id, e)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex sm:hidden items-center gap-2 min-w-0 flex-1 justify-center px-1">
              {activeProperty && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl shadow-lg shadow-gray-700/25 min-w-0 max-w-[180px]">
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white truncate w-full">{activeProperty.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg flex-shrink-0 touch-manipulation"
                    onClick={(e) => handleCloseProperty(activeProperty.id, e)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <div className="flex sm:hidden">
              <Drawer open={showMobileDrawer} onOpenChange={setShowMobileDrawer}>
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 sm:w-9 sm:h-9 p-0 hover:bg-gray-100/80 rounded-xl flex items-center justify-center touch-manipulation"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="sm:hidden max-h-[85vh]">
                  <DrawerHeader className="pb-4">
                    <DrawerTitle className="text-lg font-semibold">Options</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-8 overflow-y-auto">
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-3 px-4 py-4 h-auto justify-start bg-white/50 hover:bg-white/70 rounded-xl border border-gray-200/50 transition-all touch-manipulation"
                        onClick={() => {
                          setShowMobileDrawer(false)
                        }}
                      >
                        <Download className="w-5 h-5 text-gray-700 flex-shrink-0" />
                        <span className="text-gray-900 font-medium text-sm">Download</span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-3 px-4 py-4 h-auto justify-start bg-white/50 hover:bg-white/70 rounded-xl border border-gray-200/50 transition-all touch-manipulation"
                        onClick={() => {
                          setShowMobileDrawer(false)
                        }}
                      >
                        <Share className="w-5 h-5 text-gray-700 flex-shrink-0" />
                        <span className="text-gray-900 font-medium text-sm">Share</span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-3 px-4 py-4 h-auto justify-start bg-white/50 hover:bg-white/70 rounded-xl border border-gray-200/50 transition-all touch-manipulation"
                        onClick={() => {
                          handleNewProperty()
                          setShowMobileDrawer(false)
                        }}
                      >
                        <Plus className="w-5 h-5 text-gray-700 flex-shrink-0" />
                        <span className="text-gray-900 font-medium text-sm">New Property</span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-3 px-4 py-4 h-auto justify-start bg-white/50 hover:bg-white/70 rounded-xl border border-gray-200/50 transition-all touch-manipulation"
                        onClick={() => {
                          setShowMobileDrawer(false)
                        }}
                      >
                        <MessageSquare className="w-5 h-5 text-gray-700 flex-shrink-0" />
                        <span className="text-gray-900 font-medium text-sm">Help & Support</span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-3 px-4 py-4 h-auto justify-start bg-white/50 hover:bg-white/70 rounded-xl border border-gray-200/50 transition-all touch-manipulation"
                        onClick={() => {
                          setShowTabOverview(!showTabOverview)
                          setShowMobileDrawer(false)
                        }}
                      >
                        <Grid className="w-5 h-5 text-gray-700 flex-shrink-0" />
                        <span className="text-gray-900 font-medium text-sm">Tab Overview</span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-3 px-4 py-4 h-auto justify-start bg-white/50 hover:bg-white/70 rounded-xl border border-gray-200/50 transition-all touch-manipulation"
                        onClick={() => {
                          setShowUserProfile(!showUserProfile)
                          setShowMobileDrawer(false)
                        }}
                      >
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-900 font-medium text-sm">Profile</span>
                      </Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              {[
                { icon: Download, tooltip: "Download", onClick: () => {} },
                { icon: Share, tooltip: "Share", onClick: () => {} },
                {
                  icon: Plus,
                  tooltip: "New Property",
                  onClick: handleNewProperty,
                },
                {
                  icon: MessageSquare,
                  tooltip: "Help & Support",
                  onClick: () => {},
                },
              ].map(({ icon: Icon, tooltip, onClick }) => (
                <Tooltip key={tooltip}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-9 h-9 p-0 hover:bg-gray-100/80 rounded-xl transition-all duration-200 touch-manipulation"
                      onClick={onClick}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              <div className="relative ml-2" ref={refs.userProfile}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-9 h-9 p-0 hover:bg-gray-100/80 rounded-xl touch-manipulation"
                      onClick={() => setShowUserProfile(!showUserProfile)}
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>User Profile</p>
                  </TooltipContent>
                </Tooltip>

                <UserProfileDropdown isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
              </div>

              <div className="relative" ref={refs.tabOverview}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-9 h-9 p-0 hover:bg-gray-100/80 rounded-xl touch-manipulation"
                      onClick={() => setShowTabOverview(!showTabOverview)}
                    >
                      <Grid className="w-4.5 h-4.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tab Overview</p>
                  </TooltipContent>
                </Tooltip>

                {showTabOverview && (
                  <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-4 z-50 w-72">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Open Properties</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 rounded-lg touch-manipulation"
                        onClick={() => setShowTabOverview(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {properties.map((property) => (
                        <div
                          key={property.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation ${
                            property.isActive
                              ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg shadow-gray-700/25"
                              : "hover:bg-gray-50 border border-gray-200/50"
                          }`}
                          onClick={() => {
                            handlePropertyFocus(property.id)
                            setShowTabOverview(false)
                          }}
                        >
                          <div className="flex flex-col min-w-0">
                            <span
                              className={`text-xs font-semibold truncate ${
                                property.isActive ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {property.name}
                            </span>
                            <span
                              className={`text-xs truncate ${property.isActive ? "text-gray-300" : "text-gray-500"}`}
                            >
                              {property.address}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-6 h-6 p-0 rounded-lg flex-shrink-0 touch-manipulation ${
                              property.isActive
                                ? "hover:bg-white/20 text-gray-300 hover:text-white"
                                : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                            }`}
                            onClick={(e) => handleCloseProperty(property.id, e)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
