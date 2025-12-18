"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  // Send password reset email
  async function sendResetEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!email) {
        setError("Please enter your email address")
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setEmailSent(true)
    } catch (err: any) {
      console.error("Error:", err)
      setError("Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  // Show confirmation message after email sent
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
                We've sent a password reset link to <strong>{email}</strong>.
                Click the link in the email to reset your password.
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

        {/* Forgot Password Card */}
        <Card className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
              Reset password
            </CardTitle>
            <CardDescription className="text-slate-600">Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={sendResetEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/40"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              {"Remember your password? "}
              <Link
                href="/sign-in"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicator */}
        <div className="text-center">
          <p className="text-xs text-slate-500">Secure password reset process</p>
        </div>
      </div>
    </div>
  )
}
  
