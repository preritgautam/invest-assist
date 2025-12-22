"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Building2 } from "lucide-react"
import { AppButton } from "@/components/ui/app-button"

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Invest Assist", href: "#why-us" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-900 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Invest Assist</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in">
              <AppButton variant="ghost" size="md">
                Sign In
              </AppButton>
            </Link>
            <Link href="/sign-up">
              <AppButton variant="primary" size="md">
                Get Started
              </AppButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 px-4 border-t border-gray-200 mt-2">
                <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                  <AppButton variant="outline" size="md" className="w-full">
                    Sign In
                  </AppButton>
                </Link>
                <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                  <AppButton variant="primary" size="md" className="w-full">
                    Get Started
                  </AppButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
