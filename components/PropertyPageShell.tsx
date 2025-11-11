
"use client"

import React, { useMemo, useCallback, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  FileText,
  Building,
  Calculator,
  FileX,
  Briefcase,
  ArrowLeftRight,
  TrendingUp,
  BarChart,
  FileBarChart,
  ChevronUp,
  ChevronDown,
  Inbox,
} from "lucide-react"
import type { PropertyData } from "@/lib/property-data"
import { getPropertyById } from "@/lib/property-data"

type Props = {
  property: PropertyData | null
  children: React.ReactNode
}

const HOME_SECTION = [{ id: "home", label: "Home", icon: <Home className="w-5 h-5" /> }]
const PROPERTY_SECTIONS = [
  { id: "documents", label: "Docs", icon: <FileText className="w-5 h-5" /> },
  { id: "property", label: "Property", icon: <Building className="w-5 h-5" /> },
  { id: "pro-forma", label: "Pro Forma", icon: <Calculator className="w-5 h-5" /> },
  { id: "debt-assumptions", label: "Capital", icon: <FileX className="w-5 h-5" /> },
  { id: "business-plan", label: "Plan", icon: <Briefcase className="w-5 h-5" /> },
  { id: "sources-uses", label: "Outlay", icon: <ArrowLeftRight className="w-5 h-5" /> },
  { id: "returns", label: "Returns", icon: <TrendingUp className="w-5 h-5" /> },
  { id: "underwriting-graphs", label: "Analytics", icon: <BarChart className="w-5 h-5" /> },
  { id: "summary", label: "Summary", icon: <FileBarChart className="w-5 h-5" /> },
]

export default function PropertyPageShell({ property, children }: Props) {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)

  const propertyId = property?.id ?? null
  const activeTab = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean)
    if (parts.length >= 3 && parts[0] === "property") return parts[2]
    if (parts.length === 2 && parts[0] === "property") return "documents"
    if (pathname === "/") return "home"
    return parts[0] || "home"
  }, [pathname])

  const goTo = useCallback(
    (tabId: string) => {
      if (tabId === "home") {
        router.push("/")
        return
      }
      if (!propertyId) {
        alert("Please select a property first")
        return
      }
      const slug = tabId === "documents" ? "docs" : tabId
      router.push(`/property/${encodeURIComponent(propertyId)}/${slug}`)
    },
    [propertyId, router],
  )

  return (
    <div>
      {/* TOP ROW: property chip (left) + small action bar (right) */}
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => (propertyId ? router.push(`/property/${propertyId}/docs`) : router.push("/"))}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gray-900 text-white shadow-md"
          >
            <span className="font-semibold truncate max-w-[300px]">{property?.name ?? "No property selected"}</span>
            {property?.address && <span className="ml-2 text-xs opacity-80 truncate max-w-[420px]">{property.address}</span>}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md bg-white shadow-sm">
            <Inbox className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-md bg-white shadow-sm">+</button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">U</div>
        </div>
      </div>

      {/* SECOND ROW: Navigation with Premium Design */}
      <div className="max-w-screen-xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border sm:border-2 md:border-4 border-white p-0.5 sm:p-1 w-full">
          <div className="flex items-center justify-center py-2 bg-white/50 backdrop-blur-sm">
            <button
              onClick={() => setIsNavCollapsed((s) => !s)}
              className="flex items-center gap-2 px-4 py-1 text-xs font-medium text-gray-600 rounded-lg hover:bg-white"
            >
              {isNavCollapsed ? (
                <>
                  <ChevronDown className="w-4 h-4" /> Show Navigation
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" /> Hide Navigation
                </>
              )}
            </button>
          </div>

        </div>
        
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
                    {/* HOME SECTION */}
                    {HOME_SECTION.map((item) => {
                      const isActive = activeTab === item.id

                      return (
                        <button
                          key={item.id}
                          onClick={() => goTo(item.id)}
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

                    {/* DIVIDER */}
                    <div className="flex items-center px-0.5 md:px-1 lg:px-1 flex-shrink-0">
                      <div className="w-px h-5 sm:h-8 md:h-9 lg:h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                      <div className="hidden md:flex items-center mx-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-0.5"></div>
                        <div className="w-1 h-1 rounded-full bg-gray-400 mx-0.5"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-0.5"></div>
                      </div>
                      <div className="w-px h-5 sm:h-8 md:h-9 lg:h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                    </div>

                    {/* PROPERTY SECTIONS */}
                    {PROPERTY_SECTIONS.map((item) => {
                      const isActive = activeTab === item.id && propertyId

                      return (
                        <button
                          key={item.id}
                          onClick={() => goTo(item.id)}
                          className={`
                            group relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 
                            px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-1.5 sm:py-2 md:py-2.5 lg:py-3
                            min-w-[50px] sm:min-w-[60px] md:min-w-[65px] lg:min-w-[70px]
                            min-h-[45px] sm:min-h-[50px] md:min-h-[55px]
                            transition-all duration-300 ease-out flex-shrink-0
                            ${
                              !propertyId && item.id !== "home"
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
                                : !propertyId
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

      <main className="max-w-screen-xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}


