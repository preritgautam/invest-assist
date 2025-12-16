"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Building2,
  TrendingUp,
  Zap,
  FileText,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Briefcase,
  PieChart,
  Calculator,
} from "lucide-react"

export function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Header */}
      <nav className="backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Invest Assist
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
              Master Your Real Estate
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                Investment Deals
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Invest Assist is the all-in-one platform for professional real estate investors. Analyze deals, manage documents,
              track returns, and make data-driven investment decisions—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-600 text-gray-300 hover:text-white hover:bg-slate-800 text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                <span>Trusted by 500+ Investors</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span>99.9% Uptime SLA</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Feature Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <PieChart className="h-12 w-12 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Multi-Asset Analysis</h3>
                    <p className="text-sm text-gray-400 mt-1">Track multiple properties simultaneously</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <FileText className="h-12 w-12 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Document Management</h3>
                    <p className="text-sm text-gray-400 mt-1">Organize and analyze deal documents</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-12 w-12 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Performance Metrics</h3>
                    <p className="text-sm text-gray-400 mt-1">Real-time ROI and return calculations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-400">
              Comprehensive tools built for professional real estate investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300"></div>
              <div className="relative">
                <Calculator className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Financial Analysis</h3>
                <p className="text-gray-400 mb-4">
                  Pro Forma modeling, NPV calculations, IRR analysis, and cash flow projections with industry-standard templates.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Pro Forma Statements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Return Calculations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Sensitivity Analysis</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300"></div>
              <div className="relative">
                <FileText className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Document Management</h3>
                <p className="text-gray-400 mb-4">
                  Upload, organize, and analyze deal documents with automated extraction and intelligent document routing.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Bulk Uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Auto-Extraction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Rent Rolls & T12</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300"></div>
              <div className="relative">
                <Building2 className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Property Management</h3>
                <p className="text-gray-400 mb-4">
                  Comprehensive property tracking with location mapping, unit details, and operational metrics.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Multi-Unit Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Location Mapping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Market Analysis</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300"></div>
              <div className="relative">
                <BarChart3 className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Analytics & Reporting</h3>
                <p className="text-gray-400 mb-4">
                  Interactive dashboards and visual analytics for quick decision-making and portfolio overview.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Live Dashboards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Custom Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Export Capabilities</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300"></div>
              <div className="relative">
                <TrendingUp className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Capital Planning</h3>
                <p className="text-gray-400 mb-4">
                  Sources & uses analysis, debt structure modeling, and capital stack visualization.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Sources & Uses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Debt Modeling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Equity Stack</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300"></div>
              <div className="relative">
                <Shield className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Security & Compliance</h3>
                <p className="text-gray-400 mb-4">
                  Enterprise-grade security with encryption, access controls, and compliance features.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>End-to-End Encryption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Role-Based Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Audit Logs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Investors Choose Invest Assist
              </h2>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Accelerate Deal Analysis</h3>
                    <p className="text-gray-400">
                      Cut analysis time by 80% with automated document extraction and intelligent templating
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Better Decision Making</h3>
                    <p className="text-gray-400">
                      Real-time insights and comprehensive analytics help you make data-driven investment decisions
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Centralized Deal Hub</h3>
                    <p className="text-gray-400">
                      All your deals, documents, and analysis in one secure, accessible location
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Professional Reports</h3>
                    <p className="text-gray-400">
                      Generate executive summaries and detailed reports for stakeholders and partners
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Scale Your Operations</h3>
                    <p className="text-gray-400">
                      Manage multiple deals and portfolios with powerful organizational tools
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300 font-medium">Average Analysis Time Saved</span>
                      <span className="text-3xl font-bold text-green-400">80%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300 font-medium">Deal Processing Speed</span>
                      <span className="text-3xl font-bold text-blue-400">3x Faster</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300 font-medium">User Satisfaction</span>
                      <span className="text-3xl font-bold text-cyan-400">4.9/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Choose the plan that fits your investment needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-gray-400">For individual investors</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Up to 5 properties</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Document uploads</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full border border-slate-600 bg-transparent hover:bg-slate-700 text-gray-300">
                Get Started
              </Button>
            </div>

            {/* Professional Plan */}
            <div className="relative bg-gradient-to-br from-blue-900 to-slate-900 rounded-xl border border-blue-500/50 p-8 ring-2 ring-blue-500/50 transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="mb-8 mt-4">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-gray-300">For active investors</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Unlimited properties</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>AI-powered extraction</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                Get Started
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-gray-400">For teams and portfolios</p>
              </div>
              <div className="mb-8">
                <span className="text-gray-300">Custom pricing</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Button className="w-full border border-slate-600 bg-transparent hover:bg-slate-700 text-gray-300">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Master Your Real Estate Deals?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful investors using Invest Assist to accelerate deal analysis and grow their portfolios.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg px-8 py-6 w-full sm:w-auto">
                Start Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-slate-600 text-gray-300 hover:text-white hover:bg-slate-800 text-lg px-8 py-6 w-full sm:w-auto">
              Schedule a Demo
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-white">Invest Assist</span>
              </div>
              <p className="text-sm text-gray-400">
                Professional real estate investment analysis made simple.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                © 2024 Invest Assist. All rights reserved.
              </p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white transition">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
