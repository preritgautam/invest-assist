"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/clerk-react"
import { ArrowLeft, Loader2, Check, ChevronDown, Building2, Target, Plus, Trash2, Edit2, SquareDashed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { accessedDynamicData } from "next/dist/server/app-render/dynamic-rendering"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState("")
  const [expandedSection, setExpandedSection] = useState<"account" | "properties" | "scenarios" | null>("account")

  // Mock data for properties and scenarios
  const [properties] = useState([
    { id: 1, name: "Downtown Heights", address: "1247 Broadway Avenue, Austin, TX", status: "Active", capRate: "5.8%" },
    { id: 2, name: "Riverside Complex", address: "450 River Road, Denver, CO", status: "Active", capRate: "6.2%" },
    {
      id: 3,
      name: "Westside Towers",
      address: "789 West Avenue, Los Angeles, CA",
      status: "Analyzing",
      capRate: "5.5%",
    },
  ])

  const [scenarios] = useState([
    { id: 1, name: "Base Case - 3% Growth", property: "Downtown Heights", created: "2025-01-15", status: "Completed" },
    { id: 2, name: "Bull Case - 5% Growth", property: "Riverside Complex", created: "2025-01-14", status: "Completed" },
    {
      id: 3,
      name: "Bear Case - 1% Growth",
      property: "Downtown Heights",
      created: "2025-01-12",
      status: "In Progress",
    },
  ])

  useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumbers[0]?.phoneNumber || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      })
    }
  }, [isLoaded, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError("")
    try {
      if (!user) return

      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      if (formData.phoneNumber && user.phoneNumbers.length > 0) {
        await user.phoneNumbers[0].destroy()
      }

      if (formData.phoneNumber) {
        await user.createPhoneNumber({ phoneNumber: formData.phoneNumber })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const AccordionSection = ({
    title,
    icon,
    id,
    children,
  }: {
    title: string
    icon: React.ReactNode
    id: "account" | "properties" | "scenarios"
    children: React.ReactNode
  }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full px-6 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">{icon}</div>
        <div className="flex-1 text-left">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-600 transition-transform ${expandedSection === id ? "rotate-180" : ""}`}
        />
      </button>

      {expandedSection === id && (
        <div className="border-t border-slate-200 px-6 py-6 bg-gradient-to-b from-white to-slate-50">{children}</div>
      )}
    </div>
  )

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-600 mt-1">Manage your account and workspace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {/* Account Settings Section */}
          <AccordionSection title="Account Settings" icon={<User className="w-5 h-5 text-blue-600" />} id="account">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.firstName?.charAt(0)}
                  {formData.lastName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <p className="text-sm text-slate-600">{formData.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder="Enter your first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder="Enter your last name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {saveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-emerald-600">Profile updated successfully!</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => router.back()} className="px-6">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </AccordionSection>

          {/* My Properties Section */}
          <AccordionSection
            title={`My Properties (${properties.length})`}
            icon={<Building2 className="w-5 h-5 text-blue-600" />}
            id="properties"
          >
            <div className="space-y-3">
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No properties yet. Add one to get started.</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              ) : (
                properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{prop.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{prop.address}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                          {prop.status}
                        </span>
                        <span className="text-sm text-slate-600">Cap Rate: {prop.capRate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add New Property
              </Button>
            </div>
          </AccordionSection>

          {/* My Scenarios Section */}
          <AccordionSection
            title={`My Scenarios (${scenarios.length})`}
            icon={<Target className="w-5 h-5 text-blue-600" />}
            id="scenarios"
          >
            <div className="space-y-3">
              {scenarios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No scenarios created yet. Create one to compare investment cases.</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Scenario
                  </Button>
                </div>
              ) : (
                scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{scenario.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">Property: {scenario.property}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500">Created: {scenario.created}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            scenario.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {scenario.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Create New Scenario
              </Button>
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  )
}

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  )
}


// "use client";

// import React from "react";
// import { ArrowLeft, Loader2, Check } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface Props {
//   title?: string;
//   saving?: boolean;
//   saved?: boolean;
// }

// export default function SettingsHeader({ title = "Settings", saving = false, saved = false }: Props) {
//   const router = useRouter();

//   return (
//     <header className="bg-white border-b border-gray-200">
//       <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-4">
//         <button
//           type="button"
//           onClick={() => router.back()}
//           className="p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
//           aria-label="Back"
//         >
//           <ArrowLeft className="w-5 h-5 text-gray-700" />
//         </button>

//         <div className="flex-1">
//           <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
//           <p className="text-sm text-slate-500">Manage your account and workspace</p>
//         </div>

//         <div className="ml-auto">
//           {saving ? (
//             <div className="inline-flex items-center text-sm text-blue-600 gap-2">
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Saving changes
//             </div>
//           ) : saved ? (
//             <div className="inline-flex items-center text-sm text-emerald-600 gap-2">
//               <Check className="w-4 h-4" />
//               Saved
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </header>
//   );
// }
