"use client"

import React, { useState } from "react"
import { X } from "lucide-react"

export interface TenantChargeConfig {
  id: string
  name: string
  apiField: string
  frequency: "Monthly" | "Annual" | "One-Time"
  targetFrequency: "Monthly" | "Annual" | "One-Time"
}

export interface RentRollConfig {
  tenantCharges: TenantChargeConfig[]
}

interface RRConfigureProps {
  isOpen: boolean
  onClose: () => void
  config: RentRollConfig
  onConfigChange: (config: RentRollConfig) => void
}

export function RRConfigure({ isOpen, onClose, config, onConfigChange }: RRConfigureProps) {
  const [localConfig, setLocalConfig] = useState<RentRollConfig>(config)

  const handleFrequencyChange = (chargeId: string, newFrequency: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      tenantCharges: prev.tenantCharges.map((charge) =>
        charge.id === chargeId
          ? { ...charge, targetFrequency: newFrequency as typeof charge.targetFrequency }
          : charge,
      ),
    }))
  }

  const handleSave = () => {
    onConfigChange(localConfig)
    onClose()
  }

  const handleReset = () => {
    setLocalConfig(config)
  }

  return (
    <>
      {/* Side Panel with absolute positioning inside rent roll container */}
      <div
        className={`absolute top-0 right-0 h-full w-96 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Rent Roll Config</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Tenant Charges Configuration */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Tenant Charges</h3>
              <div className="space-y-2">
                {localConfig.tenantCharges.map((charge) => (
                  <div key={charge.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col">
                      <p className="text-xs font-semibold text-gray-700">{charge.name}</p>
                      <p className="text-xs text-gray-600 mb-2">{charge.apiField}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Current</p>
                          <p className="text-xs text-gray-600">{charge.frequency}</p>
                        </div>
                        <div className="text-xs text-gray-600">→</div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-700 block mb-1">Target</label>
                          <select
                            value={charge.targetFrequency}
                            onChange={(e) => handleFrequencyChange(charge.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Annual">Annual</option>
                            <option value="One-Time">One-Time</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-600 mt-3 flex items-start gap-2">
                <span className="text-blue-600 font-semibold mt-0.5 flex-shrink-0">ℹ</span>
                <span>Changes recalculate values automatically</span>
              </p>
            </div>

            {/* Floor Plan Configuration */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Floor Plans</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p>Map floor plans to unit types and availability</p>
              </div>
            </div>

            {/* Occupancy Configuration */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Occupancy</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p>Configure occupancy rules and vacancy tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}