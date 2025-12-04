// app/user/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Home, ChevronDown, ChevronUp, User as UserIcon, LucideBrickWall } from "lucide-react"
import AccountCard, { AccountFormData } from "@/components/user-profile/account"
import BillingCard from "@/components/user-profile/billing"

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
}

const HOME_SECTION: NavigationItem[] = [{ id: "home", label: "Home", icon: <Home className="w-5 h-5" />  }]
const PROFILE_SECTIONS: NavigationItem[] = [
  { id: "userProfile", label: "User Profile", icon: <UserIcon className="w-5 h-5" /> },
  { id: "billing", label: "Billing", icon: <LucideBrickWall className="w-5 h-5" /> },
]

export default function UserPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const [activeTab, setActiveTab] = useState<string>("userProfile")
  const [currentTabs, setCurrentTabs] = useState<string | null>("userProfile")
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [isFullscreen] = useState(false) // keep available if you want to toggle later

  const [formData, setFormData] = useState<AccountFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  })

  // Initialize form data from Clerk user
  useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      })
    }
  }, [isLoaded, user])
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState("")

  // Billing data - replace with API call when ready
  const billingData = {
    plan: "Professional",
    status: "Active",
    nextBilling: "December 13, 2025",
    amount: "$49.99",
    paymentMethod: "•••• •••• •••• 4242",
    cardType: "Visa",
  }

  const invoices = [
    { id: 1, date: "Nov 13, 2025", amount: "$49.99", status: "Paid" },
    { id: 2, date: "Oct 13, 2025", amount: "$49.99", status: "Paid" },
    { id: 3, date: "Sep 13, 2025", amount: "$49.99", status: "Paid" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name as keyof AccountFormData]: value }))
    setError("")
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError("")
    try {
      if (!user) {
        setError("User not loaded")
        setIsLoading(false)
        return
      }

      // Update user profile with Clerk
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // Update phone number if provided
      if (formData.phoneNumber) {
        // Clerk phone number updates are handled through phone numbers array
        // This is a simplified approach - you may need to adjust based on your needs
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  function onNavClick(id: string) {
   if (id === "home") {
      router.push("/") // ✅ Navigate to homepage
      return
    }
    setActiveTab(id)
    setCurrentTabs(id)
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {!isFullscreen && (
        <div className="sticky z-40 bg-gray-100 border-b border-gray-200 transition-all duration-300 ease-in-out">
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

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isNavCollapsed ? "max-h-0 opacity-0" : "max-h-32 opacity-100"}`}>
            <div className="p-1 sm:p-1.5 md:p-2">
              <div className="flex items-center">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border sm:border-2 md:border-4 border-white p-0.5 sm:p-1 w-full">
                  <nav className="bg-gradient-to-br from-gray-50 via-gray-100/80 to-gray-200/60 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 w-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.06),inset_0_-2px_4px_rgba(255,255,255,0.8)] border border-gray-200/30 backdrop-blur-sm relative">
                    <div className="flex items-center justify-between overflow-x-auto scrollbar-hide px-0.5 pb-0.5 sm:pb-0">
                      {HOME_SECTION.map((item) => {
                        const isActive = activeTab === item.id
                        return (
                          <button
                            key={item.id}
                            onClick={() => onNavClick(item.id)}
                            className={`group relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] lg:min-w-[90px] min-h-[50px] sm:min-h-[55px] md:min-h-[60px] transition-all duration-300 ease-out flex-shrink-0 ${
                              isActive ? "text-white rounded-lg sm:rounded-xl lg:rounded-2xl transform relative" : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg hover:scale-102 rounded-lg sm:rounded-xl lg:rounded-2xl transform"
                            }`}
                          >
                            {isActive && <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md sm:rounded-lg lg:rounded-xl shadow-xl z-0" />}
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 relative z-10 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                              {item.icon}
                            </div>
                            <span className={`font-bold text-center leading-tight transition-all duration-300 text-[10px] sm:text-xs md:text-xs lg:text-sm relative z-10 ${isActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"}`}>
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

                      {PROFILE_SECTIONS.map((item) => {
                        const isActive = activeTab === item.id && currentTabs
                        return (
                          <button
                            key={item.id}
                            onClick={() => onNavClick(item.id)}
                            className={`group relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-1.5 sm:py-2 md:py-2.5 lg:py-3 min-w-[50px] sm:min-w-[60px] md:min-w-[65px] lg:min-w-[70px] min-h-[45px] sm:min-h-[50px] md:min-h-[55px] transition-all duration-300 ease-out flex-shrink-0 ${
                              !currentTabs && item.id !== "home"
                                ? "text-gray-500 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 rounded-md sm:rounded-lg lg:rounded-xl"
                                : isActive
                                ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl scale-105 rounded-md sm:rounded-lg lg:rounded-xl transform ring-2 ring-gray-400"
                                : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg hover:scale-102 rounded-md sm:rounded-lg lg:rounded-xl transform"
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 flex items-center justify-center flex-shrink-0 transition-transform duration-300 relative z-10 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</div>
                            <span className={`font-semibold text-center leading-tight transition-all duration-300 text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs relative z-10 ${isActive ? "text-white" : !currentTabs ? "text-gray-500" : "text-gray-700 group-hover:text-gray-900"}`}>{item.label}</span>
                            {isActive && <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md sm:rounded-lg lg:rounded-xl shadow-xl -z-10" />}
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

      <div className=" bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex justify-center items-center min-h-[80vh] px-6 py-8">
        
            {/* Main column */}
            {activeTab === "userProfile" && (   <AccountCard
                  formData={formData}
                  handleChange={handleChange}
                  handleSave={handleSave}
                  isLoading={isLoading}
                  saveSuccess={saveSuccess}
                  error={error}
                  onCancel={() => onNavClick("home")}
                />
            )}

            {/* Right Column - show billing only when not viewing billing as full page */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <BillingCard billingData={billingData} invoices={invoices} />
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
