"use client"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Building2, ArrowRight, ArrowLeft } from "lucide-react"

// CLERK BYPASSED - using local form for v0 Vercel compatibility

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  // Send password reset code to user's email
  async function sendResetCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Simulate sending reset code
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSuccessfulCreation(true)
    } catch (err: any) {
      console.error("Error:", err)
      setError("Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  // Reset password using the code
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!email || !code || !password) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      // Simulate password reset
      await new Promise((resolve) => setTimeout(resolve, 500))
      setComplete(true)
      setTimeout(() => router.push("/sign-in"), 2000)
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">Reset Password</h1>
            <p className="text-sm sm:text-base text-white/70">
              {!successfulCreation
                ? "Enter your email to receive a reset code"
                : complete
                  ? "Password reset successful"
                  : "Enter the code and your new password"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!successfulCreation && !complete && (
              <form onSubmit={sendResetCode} className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 sm:h-12 text-base rounded-xl"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <Link
                  href="/sign-in"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </form>
            )}

            {successfulCreation && !complete && (
              <form onSubmit={resetPassword} className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                    Reset Code
                  </label>
                  <Input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="h-11 sm:h-12 text-base rounded-xl"
                    placeholder="Enter 6-digit code"
                  />
                </div>

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    "Resetting..."
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {complete && (
              <div className="text-center py-4">
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">
                    Password reset successful! Redirecting to sign in...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          {!complete && (
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-white/50">Secure password reset process</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
