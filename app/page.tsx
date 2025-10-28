"use client"

/**
 * Main Application Entry Point
 *
 * This is the root page component that serves as the entry point for the
 * Real Estate Investment Analysis application. It renders the main InvestmentApp
 * component which contains all the property analysis tools and navigation.
 *
 * @file app/page.tsx
 * @author Real Estate Analyzer Team
 * @version 1.0.0
 */

import { InvestmentApp } from "@/components/real-estate-analyzer"

/**
 * Home Component - Application Root
 *
 * The default export function that Next.js uses as the main page component.
 * This component simply renders the InvestmentApp which contains all the
 * application logic and UI components.
 *
 * @returns {JSX.Element} The main application component
 */
export default function Home() {
  return <InvestmentApp />
}
