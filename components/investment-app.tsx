/**
 * Investment App Component Export
 *
 * This file serves as a re-export module that provides an alternative import path
 * for the InvestmentApp component. It exports the InvestmentApp component from
 * the real-estate-analyzer module, allowing consumers to import it directly
 * from this location for cleaner import statements.
 *
 * Usage:
 * import InvestmentApp from '@/components/investment-app'
 *
 * This is equivalent to:
 * import { InvestmentApp } from '@/components/real-estate-analyzer'
 *
 * @module InvestmentApp
 * @see {@link @/components/real-estate-analyzer} - Source component
 */

export { InvestmentApp as default } from "@/components/real-estate-analyzer"
