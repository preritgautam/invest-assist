import type React from "react"
import {
  Home,
  FileBarChart,
  Building,
  TrendingUp,
  ArrowLeftRight,
  Calculator,
  FileX,
  Briefcase,
  BarChart3,
} from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  active?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    active: true,
  },
  {
    id: "summary",
    label: "Summary",
    icon: <FileBarChart className="w-5 h-5" />,
  },
  {
    id: "property",
    label: "Property",
    icon: <Building className="w-5 h-5" />,
  },
  {
    id: "returns",
    label: "Returns",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: "sources-uses",
    label: "Sources & Uses",
    icon: <ArrowLeftRight className="w-5 h-5" />,
  },
  {
    id: "pro-forma",
    label: "Pro Forma",
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    id: "debt-assumptions",
    label: "Financing Terms", // renamed from "Debt Assumptions" to "Financing Terms"
    icon: <FileX className="w-5 h-5" />,
  },
  {
    id: "business-plan",
    label: "Business Plan",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: "underwriting-graphs",
    label: "Charts",
    icon: <BarChart3 className="w-5 h-5" />,
  },
]

export function NavigationMenu() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-3 max-w-6xl w-full">
        <nav className="bg-gradient-to-br from-gray-50 via-gray-100/80 to-gray-200/60 rounded-2xl p-2 flex items-center gap-1 w-full overflow-x-auto scrollbar-hide shadow-inner border border-gray-200/30 backdrop-blur-sm relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-2xl before:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-t after:from-gray-300/10 after:via-transparent after:to-white/30 after:rounded-2xl after:pointer-events-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.06),inset_0_-2px_4px_rgba(255,255,255,0.8)]">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative group flex-shrink-0">
              <button
                className={`
                  flex flex-col items-center gap-2 px-2 sm:px-3 md:px-4 lg:px-5 py-4 rounded-2xl transition-all duration-300 min-w-fit backdrop-blur-sm
                  ${
                    item.active
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105 transform"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-md border border-transparent hover:border-gray-200/50"
                  }
                `}
              >
                <div
                  className={`transition-transform duration-300 ${item.active ? "scale-110" : "group-hover:scale-105"}`}
                >
                  {item.icon}
                </div>
                <span
                  className={`font-semibold text-xs sm:text-sm transition-all duration-300 text-center leading-tight max-w-[4rem] sm:max-w-[5rem] md:max-w-[6rem] lg:max-w-none ${
                    item.active ? "text-white" : ""
                  } hidden xs:inline`}
                >
                  {item.label}
                </span>
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap xs:hidden z-50 min-w-max">
                {item.label}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900/90"></div>
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
