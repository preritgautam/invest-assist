"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AppButton } from "@/components/ui/app-button"

export function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Streamline Your Underwriting?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              Join hundreds of CRE professionals who are saving time and making better 
              investment decisions with Invest Assist.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <AppButton variant="secondary" size="lg" className="px-8 py-4 text-base">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </AppButton>
              </Link>
              <Link href="/sign-in">
                <AppButton 
                  variant="ghost" 
                  size="lg" 
                  className="px-8 py-4 text-base text-white hover:text-white hover:bg-white/10"
                >
                  Sign In to Dashboard
                </AppButton>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-500 mb-4">Trusted by professionals at</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
                <span className="text-white font-semibold">CBRE</span>
                <span className="text-white font-semibold">JLL</span>
                <span className="text-white font-semibold">Cushman & Wakefield</span>
                <span className="text-white font-semibold">Marcus & Millichap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
