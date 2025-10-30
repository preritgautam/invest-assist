/**
 * Scenarios Section Component
 *
 * Displays scenario comparison for different underwriting assumptions.
 */

import { ScenarioCard } from "./scenario-card"

export function ScenariosSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Scenario Comparison</h2>
        <p className="text-xs text-gray-600 mb-3">
          Compare different underwriting scenarios to understand sensitivity and risk factors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ScenarioCard
          title="Base Case"
          description="Current assumptions"
          metrics={{
            irr: "15.2%",
            cocReturn: "8.5%",
            equity: "1.85x",
          }}
          color="blue"
        />
        <ScenarioCard
          title="Conservative"
          description="Lower rent growth, higher vacancy"
          metrics={{
            irr: "12.8%",
            cocReturn: "6.9%",
            equity: "1.62x",
          }}
          color="amber"
        />
        <ScenarioCard
          title="Aggressive"
          description="Higher rent growth, lower expenses"
          metrics={{
            irr: "18.6%",
            cocReturn: "10.2%",
            equity: "2.15x",
          }}
          color="emerald"
        />
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          + Create New Scenario
        </button>
      </div>
    </div>
  )
}
