"use client"


import type React from "react"
import { useState, useEffect } from "react"
import { useSignUp, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  useEffect(() => {
    if (isSignedIn) {
      router.push("/")
    }
  }, [isSignedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return
    setError("")
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await signUp.create({
        emailAddress: email,
        password: password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setNeedsVerification(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return
    setError("")
    setIsLoading(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode })
      if (result.status === "complete") {
        await new Promise(resolve => setTimeout(resolve, 500))
        window.location.href = "/"
      } else {
        setError("Verification failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSignedIn) {
    return null
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

      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        {!needsVerification ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
              <p className="text-slate-600 text-sm mt-1">Sign up to get started with Invest Assist</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-900">
                  Password
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

              <div id="clerk-captcha" />

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-sm transition-all disabled:opacity-50"
                disabled={isLoading || !isLoaded}
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Verify your email</h2>
              <p className="text-slate-600 text-sm mt-1">
                We sent a verification code to <span className="font-semibold">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-semibold text-slate-900">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                  required
                  maxLength={6}
                  className="h-11 border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-center text-lg tracking-widest font-semibold"
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-sm transition-all disabled:opacity-50"
                disabled={isLoading || !isLoaded || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNeedsVerification(false)
                    setVerificationCode("")
                    setError("")
                  }}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Back to sign up
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}