"use client"

import Image from "next/image"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {

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

      {/* Clerk SignUp Component */}
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl border-0 bg-white rounded-xl",
              headerTitle: "text-2xl font-bold text-slate-900",
              headerSubtitle: "text-slate-600",
              formButtonPrimary: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold h-11 shadow-md transition-all",
              formFieldInput: "h-11 border-slate-200 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
              formFieldLabel: "text-sm font-medium text-slate-900",
              dividerLine: "bg-slate-200",
              dividerText: "text-slate-500 text-sm",
              socialButtonsBlockButton: "border-slate-200 text-slate-700 hover:bg-slate-50",
              socialButtonsBlockButtonText: "font-medium",
              footerActionLink: "text-blue-600 font-medium hover:text-blue-700",
              identityPreviewText: "text-slate-600",
              identityPreviewButton: "text-blue-600 hover:text-blue-700 font-medium",
              badge: "bg-blue-100 text-blue-700",
              otpCodeFieldInput: "h-11 border-slate-200 bg-white text-slate-900",
              formResendCodeLink: "text-blue-600 hover:text-blue-700 font-medium",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }}
        />
      </div>
    </div>
  )
}