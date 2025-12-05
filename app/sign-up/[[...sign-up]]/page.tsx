"use client"

import type React from "react"
import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp()
  const router = useRouter()
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded || !signUp) return

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      })

      if (result.status === "complete") {
        router.push("/")
      } else {
        setError("Sign up failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col items-center justify-center p-4">
      {/* Header with Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow-2xl shadow-blue-300/50 px-8 py-6 mb-6 border border-blue-100">
          <Image
            src="/investassist-logo.png"
            alt="Invest Assist Logo"
            width={200}
            height={80}
            priority
            className="h-20 w-auto"
          />
        </div>
        <p className="text-center text-sm text-slate-500">Professional investment deal management platform</p>
      </div>

      {/* Sign Up Card */}
      <Card className="w-full max-w-md border-0 bg-white shadow-xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Get Started
          </CardTitle>
          <CardDescription className="text-slate-600">Create your account to access your investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-slate-900">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-slate-900">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-900">
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
                className="h-11 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-900">
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
                className="h-11 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-900">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isLoaded}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link 
              href="/sign-in"
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}