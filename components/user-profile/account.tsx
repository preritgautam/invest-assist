// components/account.tsx
"use client"

import React from "react"
import { Loader2, Check, User } from "lucide-react"

export type AccountFormData = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

type Props = {
  formData: AccountFormData
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSave: () => Promise<void>
  isLoading: boolean
  saveSuccess: boolean
  error: string
  onCancel: () => void
}

export default function AccountCard({
  formData,
  handleChange,
  handleSave,
  isLoading,
  saveSuccess,
  error,
  onCancel,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>
            <p className="text-xs text-slate-600">Update your personal information</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-200">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {formData.firstName?.charAt(0)}
            {formData.lastName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-sm text-slate-600">{formData.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-2">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-600">Profile updated successfully!</p>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
