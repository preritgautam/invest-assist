"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!email) {
        setError("Email is required")
        setIsLoading(false)
        return
      }

      // In a real implementation, this would send a password reset email via Clerk
      // For now, we'll show a message to the user
      setMessage("If an account exists with this email, you will receive a password reset link.")
      setEmail("")
      
      // Redirect to sign-in after a delay
      setTimeout(() => {
        router.push("/sign-in")
      }, 3000)
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Logo Header */}
      <div className="mb-8">
        <Image src="/investassist-logo.png" alt="Invest Assist" width={120} height={120} className="mx-auto" />
      </div>

      {/* Reset Password Card */}
      <div className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl w-full max-w-md rounded-lg p-8">
        <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent mb-2">
          Reset password
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full border border-slate-200/60 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded px-3"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!message}
            className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
