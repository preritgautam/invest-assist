"use client"

import type React from "react"

import { useState } from "react"
import { useUser, useClerk } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2, Check } from "lucide-react"

interface ProfileUpdateDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileUpdateDialog({ isOpen, onClose }: ProfileUpdateDialogProps) {
  const { user } = useUser()
  const { user: clerkUser } = useClerk()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phoneNumber: user?.phoneNumbers?.[0]?.phoneNumber || "",
  })
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    setIsSaved(false)
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError("")

      if (user) {
        // Update first and last name
        if (formData.firstName !== user.firstName || formData.lastName !== user.lastName) {
          await user.update({
            firstName: formData.firstName,
            lastName: formData.lastName,
          })
        }

        // Update phone number if available
        if (formData.phoneNumber && formData.phoneNumber !== user.phoneNumbers?.[0]?.phoneNumber) {
          if (user.phoneNumbers.length > 0) {
            await user.phoneNumbers[0].update({ phoneNumber: formData.phoneNumber })
          } else {
            // Add new phone number
            await user.createPhoneNumber({ phoneNumber: formData.phoneNumber })
          }
        }
      }

      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
      console.error("[v0] Profile update error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Update Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">First Name</label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Last Name</label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Email</label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Phone Number</label>
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {isSaved && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700">Profile updated successfully!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end border-t border-gray-200 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
