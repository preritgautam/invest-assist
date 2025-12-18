"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
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
      if (!formData.companyName || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
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

      // Generate slug from company name
      const companySlug = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            company_name: formData.companyName,
            company_slug: companySlug,
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="rounded-xl bg-white p-4 shadow-lg shadow-slate-200/50">
              <Image
                src="/investassist-logo.png"
                alt="Invest Assist"
                width={200}
                height={60}
                className="h-auto"
                priority
              />
            </div>
          </div>

          <Card className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent mb-2">
                Check your email
              </h2>
              <p className="text-slate-600 mb-6">
                We've sent a confirmation link to <strong>{formData.email}</strong>.
                Please check your inbox and click the link to verify your account.
              </p>
              <Link
                href="/sign-in"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700"
              >
                Back to Sign In
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="rounded-xl bg-white p-4 shadow-lg shadow-slate-200/50">
            <Image
              src="/investassist-logo.png"
              alt="Invest Assist"
              width={200}
              height={60}
              className="h-auto"
              priority
            />
          </div>
        </div>

        {/* Sign Up Card */}
        <Card className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
              Get started
            </CardTitle>
            <CardDescription className="text-slate-600">Create your account and start analyzing properties</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                  Company name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Your Company LLC"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/40"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              {"Already have an account? "}
              <Link
                href="/sign-in"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
