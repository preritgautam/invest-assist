"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Building2, ArrowRight, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validation
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        setError("All fields are required")
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters")
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setEmailSent(true)
        setLoading(false)
      } else if (data.session) {
        // Auto-confirmed (email confirmation disabled in Supabase)
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred during sign up")
      setLoading(false)
    }
  }

  // Show confirmation message after signup
  if (emailSent) {
    return (
      <div className="min-h-screen bg-[oklch(0.25_0.03_240)] flex flex-col">
        <header className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-white">
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-bold">Invest Assist</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a confirmation link to <strong>{formData.email}</strong>.
                Please check your inbox and click the link to verify your account.
              </p>
              <Link
                href="/sign-in"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">Get Started</h1>
            <p className="text-sm sm:text-base text-white/70">Create your account and start analyzing properties</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="h-11 sm:h-12 text-base rounded-xl"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="h-11 sm:h-12 text-base rounded-xl"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 sm:h-12 text-base rounded-xl"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 sm:h-12 text-base rounded-xl"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  "Creating account..."
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-white/50">
              Join thousands of investors analyzing properties with confidence
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
