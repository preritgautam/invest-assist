"use client"

import Image from "next/image"
import { SignUp } from "@clerk/nextjs"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col items-center justify-center p-4">
      <style>{`
        .cl-footer {
          display: none !important;
        }
        .cl-footerPagesLink {
          display: none !important;
        }
        .cl-poweredByClerk {
          display: none !important;
        }
      `}</style>
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

      {/* Clerk SignUp Component */}
      <div className="w-full max-w-lg">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              card: "shadow-lg border-0 bg-white rounded-lg p-8",
              headerTitle: "text-2xl font-bold text-slate-900 text-center",
              headerSubtitle: "text-slate-600 text-sm text-center",
              form: "space-y-5",
              formButtonPrimary: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold h-11 shadow-sm transition-all rounded-lg w-full",
              formFieldInput: "h-11 border border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 rounded-lg",
              formFieldLabel: "text-sm font-semibold text-slate-900 block mb-2",
              formFieldInputShowPasswordButton: "text-slate-500 hover:text-slate-700",
              dividerLine: "bg-slate-300",
              dividerText: "text-slate-500 text-sm font-medium",
              socialButtonsBlockButton: "border border-slate-300 text-slate-700 hover:bg-slate-50 h-11 rounded-lg w-full",
              socialButtonsBlockButtonText: "font-medium text-sm",
              footerActionLink: "text-blue-600 font-semibold hover:text-blue-700",
              identityPreviewText: "text-slate-600 text-sm",
              identityPreviewButton: "text-blue-600 hover:text-blue-700 font-semibold",
              badge: "bg-blue-100 text-blue-700 text-xs font-semibold",
              otpCodeFieldInput: "h-11 border border-slate-300 bg-white text-slate-900 font-semibold text-center tracking-widest rounded-lg",
              formResendCodeLink: "text-blue-600 hover:text-blue-700 font-semibold text-sm",
              backButton: "text-blue-600 hover:text-blue-700 font-semibold",
              verificationLinkStatusIcon: "text-blue-600",
              alternativeMethodsBlockButton: "text-blue-600 hover:text-blue-700 font-semibold text-sm",
              alternativeMethodsBlockButtonText: "text-slate-600",
              formFieldSuccessIcon: "text-green-500",
              formFieldErrorText: "text-red-600 text-xs font-medium",
              formFieldError: "text-red-600",
              footer: "hidden",
              poweredByClerk: "hidden",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            },
          }}
          redirectUrl="/"
          signInUrl="/sign-in"
        />
           {/* Footer Text Inside Box */}
        <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-200 pt-4">
         {"Already have an account? "}
            <Link 
              href="/sign-in"
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Sign In
            </Link>
        </div>
      </div>
    </div>
  )
}