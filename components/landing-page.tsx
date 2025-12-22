"use client"

import {
  Navbar,
  Hero,
  Features,
  Workflow,
  WhyUs,
  Security,
  Pricing,
  CTA,
  Footer,
} from "@/components/landing"

/**
 * Landing Page Component
 * 
 * Main marketing page for Invest Assist - a CRE document analysis 
 * and underwriting platform. Assembles all landing page sections
 * into a cohesive, scrollable experience.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation */}
      <Navbar />

      {/* Main Content */}
      <main>
        {/* Hero Section - Value proposition & primary CTAs */}
        <Hero />

        {/* Features Grid - All product capabilities */}
        <Features />

        {/* Workflow - Step-by-step process */}
        <Workflow />

        {/* Why Us - Key benefits & differentiators */}
        <WhyUs />

        {/* Security - Trust & data protection */}
        <Security />

        {/* Pricing - Plans & tiers */}
        <Pricing />

        {/* Final CTA - Conversion push */}
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
