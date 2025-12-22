"use client"

import Link from "next/link"
import { ArrowRight, FileText, BarChart3, CheckCircle2 } from "lucide-react"
import { AppButton } from "@/components/ui/app-button"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/60 shadow-sm mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">AI-Powered CRE Document Analysis</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            Streamline Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Commercial Real Estate
            </span>{" "}
            Underwriting
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload rent rolls, operating statements, and offering memorandums. Let AI extract, validate, 
            and analyze your data — so you can focus on making better investment decisions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/sign-up">
              <AppButton variant="primary" size="lg" className="px-8 py-4 text-base">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </AppButton>
            </Link>
            <Link href="/sign-in">
              <AppButton variant="outline" size="lg" className="px-8 py-4 text-base">
                Sign In to Dashboard
              </AppButton>
            </Link>
          </div>

          {/* Workflow Preview */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <WorkflowStep 
              icon={<FileText className="w-5 h-5" />}
              step="1"
              label="Upload Documents"
            />
            <div className="hidden sm:block w-12 h-0.5 bg-gray-300" />
            <WorkflowStep 
              icon={<CheckCircle2 className="w-5 h-5" />}
              step="2"
              label="Validate & Map"
            />
            <div className="hidden sm:block w-12 h-0.5 bg-gray-300" />
            <WorkflowStep 
              icon={<BarChart3 className="w-5 h-5" />}
              step="3"
              label="Analyze & Invest"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function WorkflowStep({ icon, step, label }: { icon: React.ReactNode; step: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl border border-gray-200 shadow-sm">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-xs font-medium text-gray-500">Step {step}</p>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
      </div>
    </div>
  )
}
