"use client"

import { Shield, Lock, CheckCircle } from "lucide-react"

const securityFeatures = [
  "Bank-level encryption for all data",
  "Secure document storage with access controls",
  "SOC 2 compliant infrastructure",
  "Role-based user permissions",
  "Automatic data backup & recovery",
  "HTTPS/TLS encryption in transit"
]

export function Security() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-3xl border border-gray-200/60 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-6">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Enterprise-Grade Security</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Your Data is Safe With Us
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We take security seriously. Your property data, financial documents, and investment 
                analyses are protected with industry-leading security measures.
              </p>

              {/* Security Features */}
              <ul className="space-y-3">
                {securityFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-blue-100/50 rounded-full animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-blue-100/70 rounded-full" />
                </div>
                
                {/* Center icon */}
                <div className="relative w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-gray-200">
                  <Lock className="w-12 h-12 text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
