"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useClerk, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const { client } = useClerk()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isSignedIn) {
      router.push("/")
    }
  }, [isSignedIn, router])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !email) return

    setError("")
    setIsLoading(true)

    try {
      await client.signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      setStep("code")
    } catch (err: any) {
      console.error("Error sending reset code:", err)
      setError(err.errors?.[0]?.message || "Failed to send reset code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !code) return

    setError("")
    setIsLoading(true)

    try {
      // Attempt to set the code first - this validates it
      await client.signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code,
      })
      setStep("password")
    } catch (err: any) {
      console.error("Error verifying code:", err)
      setError(err.errors?.[0]?.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !password) return

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const signInAttempt = client.signIn
      
      if (!signInAttempt) {
        setError("Sign in session not found")
        setIsLoading(false)
        return
      }

      // After email code verification for password reset, the status is "needs_new_password"
      // We complete the reset by calling attemptFirstFactor with the new password
      const result = await signInAttempt.attemptFirstFactor({
        strategy: "password",
        password: password,
      })

      // Check if sign-in is complete or if we need to do another step
      if (result?.status === "complete") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        window.location.href = "/"
      } else {
        // If still not complete, try completing the session creation
        setError("Password reset failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Error resetting password:", err)
      setError(err.errors?.[0]?.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col items-center justify-center p-4">
      {/* Header with Logo */}
      <div className="mb-12 flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-5 mb-4 border border-blue-100">
          <Image
            src="/investassist-logo.png"
            alt="Invest Assist Logo"
            width={200}
            height={80}
            priority
            className="h-14 w-auto"
          />
        </div>
        <p className="text-center text-sm text-slate-600">Professional investment deal management platform</p>
      </div>

      {/* Forgot Password Form */}
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Reset password</h2>
          <p className="text-slate-600 text-sm mt-1">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "code" && "Enter the code sent to your email"}
            {step === "password" && "Create a new password"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-900">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-sm transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset code"}
            </Button>

            <div className="text-center text-sm text-slate-600">
              <Link
                href="/sign-in"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-semibold text-slate-900">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                required
                maxLength={6}
                className="h-11 border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center text-lg tracking-widest font-semibold"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-sm transition-all disabled:opacity-50"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify code"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("email")
                  setCode("")
                  setError("")
                }}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-900">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-900">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-sm transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("code")
                  setPassword("")
                  setConfirmPassword("")
                  setError("")
                }}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
