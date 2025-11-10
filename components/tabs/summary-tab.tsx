"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Building, Calculator, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppButton } from "@/components/ui/app-button" // ✅ if you already have this button component
import { getPropertyById } from "@/lib/property-data"

/**
 * Property interface
 */
interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

/**
 * Props for SummaryTab
 */
interface SummaryTabProps {
  property: Property | null
}

/**
 * SummaryTab Component
 */
export function SummaryTab({ property }: SummaryTabProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users")
        const data = await res.json()
        console.log("Fetched users:", data)
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  /**
   * Sends a sample email (uses Mailgun API route)
   */
  // async function handleSendMail() {
  //   if (!property) return
  //   setSending(true)

  //   try {
  //     const res = await fetch("/api/send-email", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         to: "investor@example.com",
  //         subject: `Investment Summary - ${property.name}`,
  //         html: `
  //           <h2>Investment Summary Ready 📊</h2>
  //           <p>Your property <strong>${property.name}</strong> has been processed.</p>
  //           <p>Address: ${property.address}</p>
  //           <p><a href="https://yourapp.com/properties/${property.id}">View in Dashboard</a></p>
  //         `,
  //       }),
  //     })

  //     const data = await res.json()
  //     if (data.success) {
  //       alert("✅ Email sent successfully!")
  //     } else {
  //       alert("❌ Failed to send email: " + data.error)
  //     }
  //   } catch (err) {
  //     console.error("Mail send error:", err)
  //     alert("Error sending mail.")
  //   } finally {
  //     setSending(false)
  //   }
  // }

  // === UI Rendering ===
  if (!property) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Investment Summary</h2>
        <p className="text-sm text-gray-600">Select a property to view summary details.</p>
      </div>
    )
  }

  const propertyData = getPropertyById(property.id)

  if (!propertyData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{property.name}</h2>
        <p className="text-sm text-gray-600 mb-4">No data available for this property yet.</p>

        {/* ✅ Send Mail Button */}
        {/* <AppButton
          onClick={handleSendMail}
          disabled={sending}
          className="flex items-center gap-2 mx-auto"
        >
          <Mail className="w-4 h-4" />
          {sending ? "Sending..." : "Send Mail"}
        </AppButton> */}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg border-2 border-white p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
            <Building className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">{property.name}</h1>
            <p className="text-xs text-gray-600">Investment Summary</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Summary Data Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          Financial metrics, property gallery, and investment analysis will be populated when you add property details.
        </p>

        <div className="text-sm text-gray-500 space-y-1 mb-4">
          <p>• Key Metrics (Offer Price, Cap Rate, IRR, etc.)</p>
          <p>• Property Gallery & Information</p>
          <p>• Pro Forma Projections</p>
          <p>• Investment Returns Analysis</p>
          <p>• Sources & Uses Breakdown</p>
          <p>• Business Plan Highlights</p>
        </div>

        {/* ✅ Send Mail Button */}
        {/* <AppButton
          onClick={handleSendMail}
          disabled={sending}
          className="flex items-center gap-2 mx-auto"
        >
          <Mail className="w-4 h-4" />
          {sending ? "Sending..." : "Send Mail"}
        </AppButton> */}
      </div>
    </div>
  )
}
