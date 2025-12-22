"use client"

import { Check } from "lucide-react"
import Link from "next/link"
import { AppButton } from "@/components/ui/app-button"

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted: boolean
  cta: string
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for trying out Invest Assist on your first few deals.",
    features: [
      "Up to 5 properties",
      "10 document uploads/month",
      "Basic rent roll extraction",
      "Pro forma generation",
      "Email support"
    ],
    highlighted: false,
    cta: "Get Started Free"
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "For active investors and small teams analyzing multiple deals.",
    features: [
      "Unlimited properties",
      "Unlimited document uploads",
      "Advanced AI extraction",
      "Dynamic column mapping",
      "Returns & analytics",
      "Priority support",
      "Team collaboration (3 users)"
    ],
    highlighted: true,
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For firms with high volume and custom integration needs.",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SSO & advanced security",
      "Custom training & onboarding"
    ],
    highlighted: false,
    cta: "Contact Sales"
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Start free and scale as your portfolio grows. No hidden fees, no long-term contracts.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} tier={tier} />
          ))}
        </div>

        {/* FAQ Teaser */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Have questions? <a href="#" className="text-gray-900 font-medium hover:underline">View our FAQ</a> or{" "}
            <a href="mailto:support@investassist.com" className="text-gray-900 font-medium hover:underline">contact us</a>.
          </p>
        </div>
      </div>
    </section>
  )
}

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div 
      className={`relative rounded-2xl border p-8 ${
        tier.highlighted 
          ? "bg-gray-900 border-gray-900 text-white shadow-xl scale-105" 
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* Highlighted Badge */}
      {tier.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-gray-900 text-sm font-semibold rounded-full shadow-md">
          Most Popular
        </div>
      )}

      {/* Tier Header */}
      <div className="mb-6">
        <h3 className={`text-xl font-semibold mb-2 ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
          {tier.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
            {tier.price}
          </span>
          {tier.period && (
            <span className={tier.highlighted ? "text-gray-400" : "text-gray-500"}>{tier.period}</span>
          )}
        </div>
        <p className={`mt-2 text-sm ${tier.highlighted ? "text-gray-400" : "text-gray-600"}`}>
          {tier.description}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className={`w-5 h-5 flex-shrink-0 ${tier.highlighted ? "text-green-400" : "text-green-600"}`} />
            <span className={`text-sm ${tier.highlighted ? "text-gray-300" : "text-gray-600"}`}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link href="/sign-up" className="block">
        <AppButton 
          variant={tier.highlighted ? "secondary" : "primary"} 
          size="lg" 
          className="w-full justify-center"
        >
          {tier.cta}
        </AppButton>
      </Link>
    </div>
  )
}
