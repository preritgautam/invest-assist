// "use client"

// import { InvestmentApp } from "@/components/real-estate-analyzer"
// import { useAuth } from "@clerk/nextjs"
// import { useRouter } from "next/navigation"
// import { useEffect, useRef } from "react"

// export default function Home() {
//   const { isLoaded, userId } = useAuth()
//   const router = useRouter()
//   const hasRedirected = useRef(false)

//   useEffect(() => {
//     // Only redirect once and only if not authenticated
//     if (isLoaded && !userId && !hasRedirected.current) {
//       hasRedirected.current = true
//       router.push('/sign-in')
//     }
//   }, [isLoaded, userId, router])

//   // Show loading state while auth is loading OR while redirecting
//   if (!isLoaded || (!userId && isLoaded)) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   // User is authenticated, show the app
//   return <InvestmentApp />
// }

"use client"

import { HomeTab } from "@/components/tabs/home-tab"
import { TabBar } from "@/components/tab-bar"
import { useRouter } from "next/navigation"
import { useCallback, useState, useEffect, useLayoutEffect } from "react"
import { Home as HomeIcon, ChevronDown, ChevronUp } from "lucide-react"
import type React from "react"

export default function Home() {
  const router = useRouter()
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Initialize state with empty array - hydration safe
  const [openPropertyIds, setOpenPropertyIds] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Use useLayoutEffect to load from sessionStorage as early as possible (before paint)
  // but after hydration is complete
  useLayoutEffect(() => {
    const saved = sessionStorage.getItem("openPropertyIds")
    if (saved) {
      try {
        setOpenPropertyIds(JSON.parse(saved))
      } catch (e) {
        setOpenPropertyIds([])
      }
    }
    setIsHydrated(true)
  }, [])

  // Save open properties to session storage whenever they change
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem("openPropertyIds", JSON.stringify(openPropertyIds))
    }
  }, [openPropertyIds, isHydrated])

  const handlePropertyEdit = useCallback(
    (propertyId: string) => {
      // Add to open properties
      setOpenPropertyIds((prev) => {
        const newIds = prev.includes(propertyId) ? prev : [...prev, propertyId]
        sessionStorage.setItem("openPropertyIds", JSON.stringify(newIds))
        return newIds
      })
      // Navigate to the property's documents page
      router.push(`/properties/${propertyId}/documents`)
    },
    [router],
  )

  const handlePropertyClose = useCallback((propertyId: string) => {
    setOpenPropertyIds((prev) => {
      const newIds = prev.filter((id) => id !== propertyId)
      sessionStorage.setItem("openPropertyIds", JSON.stringify(newIds))
      return newIds
    })
  }, [])

  const handlePropertyFocus = useCallback(
    (propertyId: string) => {
      router.push(`/properties/${propertyId}/documents`)
    },
    [router],
  )

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev)
    setIsNavCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <TabBar
        onPropertyClose={handlePropertyClose}
        onPropertyFocus={handlePropertyFocus}
        activePropertyName={undefined}
        openPropertyIds={openPropertyIds}
        activePropertyId={null}
        activeProperty={null}
        onNavigationClick={() => {}}
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
                      <button
                        className="
                          group relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 
                          px-2 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5
                          min-w-[60px] sm:min-w-[70px] md:min-w-[80px] lg:min-w-[90px]
                          min-h-[50px] sm:min-h-[55px] md:min-h-[60px]
                          transition-all duration-300 ease-out flex-shrink-0
                          text-white rounded-lg sm:rounded-xl lg:rounded-2xl transform relative
                        "
                      >
                        <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md sm:rounded-lg lg:rounded-xl shadow-xl z-0" />
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 relative z-10 scale-110">
                          <HomeIcon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-center leading-tight transition-all duration-300 text-[10px] sm:text-xs md:text-xs lg:text-sm relative z-10 text-white">
                          Home
                        </span>
                      </button>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 sm:p-3 md:p-4 lg:p-5">
        <HomeTab 
          onPropertyEdit={handlePropertyEdit} 
          openPropertyIds={openPropertyIds}
        />
      </div>
    </div>
  )
}
