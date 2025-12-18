"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        setError("Email and password are required")
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred during sign in")
      setLoading(false)
    }
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

        {/* Sign In Card */}
        <Card className="border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-600">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-slate-200/60 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/40"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              {"Don't have an account? "}
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:from-blue-700 hover:to-cyan-700"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
