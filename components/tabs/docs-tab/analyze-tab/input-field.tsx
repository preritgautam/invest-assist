"use client"

/**
 * Input Field Component
 *
 * Reusable input field with label, prefix/suffix support, and data source attribution.
 */

interface InputFieldProps {
  label: string
  value: number | undefined
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  highlighted?: boolean
  source?: string
  disabled?: boolean
}

export function InputField({ label, value, onChange, prefix, suffix, highlighted, source, disabled }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {source && <span className="text-xs text-slate-500 ml-1">({source})</span>}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{prefix}</span>}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
          disabled={disabled}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            prefix ? "pl-6" : ""
          } ${suffix ? "pr-12" : ""} ${
            highlighted ? "bg-blue-50 border-blue-300 font-bold text-blue-900" : "border-gray-300 bg-white"
          } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{suffix}</span>}
      </div>
    </div>
  )
}
