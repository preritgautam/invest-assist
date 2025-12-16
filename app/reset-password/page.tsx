"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Building2, ArrowRight, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!password || !confirmPassword) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters")
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/"), 2000)
    } catch (err: any) {
      console.error("Error:", err)
      setError("Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.25_0.03_240)] flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex items-center gap-2 text-white">
          <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-lg sm:text-xl font-bold">Invest Assist</span>
        </div>
      </header>

      {/* Main Content - Centered Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Welcome Text - Mobile First */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
              {success ? "Password Reset!" : "Set New Password"}
            </h1>
            <p className="text-sm sm:text-base text-white/70">
              {success ? "Your password has been updated" : "Enter your new password below"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!success ? (
              <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 sm:h-12 text-base rounded-xl"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 sm:h-12 text-base rounded-xl"
                    placeholder="Re-enter password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    "Updating..."
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h2>
                <p className="text-gray-600 mb-4">
                  Your password has been successfully reset. Redirecting you to the dashboard...
                </p>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          {!success && (
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-white/50">Secure password update process</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
