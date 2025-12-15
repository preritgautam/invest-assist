"use client"

import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp()
  const router = useRouter()
  const [step, setStep] = useState<"form" | "verify">("form")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

    if (!isLoaded) {
      return
    }

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("All fields are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })

      setStep("verify")
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isLoaded) {
      return
    }

    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      // Email verified and sign-up complete
      if (completeSignUp.status === "complete") {
        router.push("/")
      } else {
        setError("Sign up incomplete. Please try again.")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
        {/* Logo Header */}
        <div className="mb-8">
          <Image src="/investassist-logo.png" alt="Invest Assist" width={120} height={120} className="mx-auto" />
        </div>

        {/* Sign Up Card */}
        <div className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl w-full max-w-md rounded-lg p-8">
          <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent mb-2">
            Create account
          </h2>
          <p className="text-slate-600 text-sm mb-6">Get started with your investment analysis</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
              />
              <p className="text-xs text-slate-500">At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
              />
            </div>

            {/* Clerk CAPTCHA container - required for custom sign-up flow */}
            <div id="clerk-captcha" className="my-4" />

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {"Already have an account? "}
            <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Verification step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Logo Header */}
      <div className="mb-8">
        <Image src="/investassist-logo.png" alt="Invest Assist" width={120} height={120} className="mx-auto" />
      </div>

      {/* Verification Card */}
      <div className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl w-full max-w-md rounded-lg p-8">
        <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent mb-2">
          Verify your email
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          We sent a verification code to <strong>{formData.email}</strong>. Enter the code below to verify your email.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-slate-700">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
              className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4 text-center text-lg tracking-widest"
            />
            <p className="text-xs text-slate-500">Check your email for the 6-digit code</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            {isLoading ? "Verifying..." : "Verify email"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("form")
              setVerificationCode("")
              setError("")
            }}
            className="h-11 w-full border border-slate-200/60 font-semibold text-slate-700 hover:bg-slate-50 rounded"
          >
            Back to sign up
          </button>
        </form>
      </div>
    </div>
  )

  // Verification step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Logo Header */}
      <div className="mb-8">
        <Image src="/investassist-logo.png" alt="Invest Assist" width={120} height={120} className="mx-auto" />
      </div>

      {/* Sign Up Card */}
      <div className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl w-full max-w-md rounded-lg p-8">
        <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent mb-2">
          Create account
        </h2>
        <p className="text-slate-600 text-sm mb-6">Get started with your investment analysis</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
            />
            <p className="text-xs text-slate-500">At least 8 characters</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4"
            />
          </div>

          {/* Clerk CAPTCHA container - required for custom sign-up flow */}
          <div id="clerk-captcha" className="my-4" />

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {"Already have an account? "}
          <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
