import type React from "react"
import {
  ArrowRight,
  ArrowDown,
  Home,
  FileText,
  Building2,
  Sheet,
  DollarSign,
  Target,
  ArrowLeftRight,
  TrendingUp,
  BarChart3,
  FileBarChart,
  User,
  Lock,
  UserPlus,
  LogIn,
  Shield,
  Settings,
} from "lucide-react"

export default function MoodboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">InvestAssist UI/UX Workflow</h1>
          <p className="text-slate-600">Complete application structure and user journey map</p>
        </div>

        {/* Legend */}
        <div className="mb-8 flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-600">Existing Screens</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-slate-600">Proposed Screens</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-slate-600">Admin Screens</span>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="space-y-12">
          {/* Authentication Flow */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Authentication Flow
            </h2>
            <div className="flex flex-wrap items-start gap-4 justify-center">
              {/* Landing/Login */}
              <WireframeBox
                title="Landing Page"
                icon={<LogIn className="w-6 h-6" />}
                color="green"
                description="Entry point for new users"
                features={["Hero section", "Features overview", "CTA buttons"]}
              />
              <ArrowRight className="w-6 h-6 text-slate-400 mt-12 hidden sm:block" />

              {/* Login */}
              <WireframeBox
                title="Login"
                icon={<LogIn className="w-6 h-6" />}
                color="green"
                description="User authentication"
                features={["Email/password", "Remember me", "Forgot password link"]}
              />
              <ArrowRight className="w-6 h-6 text-slate-400 mt-12 hidden sm:block" />

              {/* Sign Up */}
              <WireframeBox
                title="Sign Up"
                icon={<UserPlus className="w-6 h-6" />}
                color="green"
                description="New user registration"
                features={["Email/password", "Terms acceptance", "Email verification"]}
              />
            </div>
            <div className="flex justify-center my-4">
              <ArrowDown className="w-6 h-6 text-slate-400" />
            </div>
          </section>

          {/* Main Application Flow */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Home className="w-6 h-6" />
              Main Application Flow
            </h2>

            {/* Home Screen */}
            <div className="flex justify-center mb-8">
              <WireframeBox
                title="Home / Portfolio"
                icon={<Home className="w-6 h-6" />}
                color="blue"
                description="Main dashboard - Always accessible"
                features={["Property cards", "Create new property", "Portfolio overview", "Quick stats"]}
                large
              />
            </div>

            <div className="flex justify-center my-4">
              <ArrowDown className="w-6 h-6 text-slate-400" />
              <span className="text-sm text-slate-600 mx-2">Select Property</span>
              <ArrowDown className="w-6 h-6 text-slate-400" />
            </div>

            {/* Property Analysis Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <WireframeBox
                title="Docs"
                icon={<FileText className="w-5 h-5" />}
                color="blue"
                description="Property documentation"
                features={["Upload files", "Document viewer", "File management"]}
              />
              <WireframeBox
                title="Property Details"
                icon={<Building2 className="w-5 h-5" />}
                color="blue"
                description="Basic property info"
                features={["Address", "Type", "Size", "Purchase details"]}
              />
              <WireframeBox
                title="Pro Forma"
                icon={<Sheet className="w-5 h-5" />}
                color="blue"
                description="Financial projections"
                features={["Income projections", "Expense estimates", "NOI calculations"]}
              />
              <WireframeBox
                title="Capital"
                icon={<DollarSign className="w-5 h-5" />}
                color="blue"
                description="Financing details"
                features={["Debt assumptions", "Loan terms", "Interest rates"]}
              />
              <WireframeBox
                title="Plan"
                icon={<Target className="w-5 h-5" />}
                color="blue"
                description="Business strategy"
                features={["Investment thesis", "Exit strategy", "Timeline"]}
              />
              <WireframeBox
                title="Outlay"
                icon={<ArrowLeftRight className="w-5 h-5" />}
                color="blue"
                description="Sources & uses"
                features={["Capital sources", "Fund allocation", "Budget breakdown"]}
              />
              <WireframeBox
                title="Returns"
                icon={<TrendingUp className="w-5 h-5" />}
                color="blue"
                description="Investment returns"
                features={["IRR", "Cash-on-cash", "Equity multiple"]}
              />
              <WireframeBox
                title="Analytics"
                icon={<BarChart3 className="w-5 h-5" />}
                color="blue"
                description="Visual analysis"
                features={["Charts", "Graphs", "Trend analysis"]}
              />
              <WireframeBox
                title="Summary"
                icon={<FileBarChart className="w-5 h-5" />}
                color="blue"
                description="Complete overview"
                features={["Executive summary", "Key metrics", "Export report"]}
              />
            </div>
          </section>

          {/* User Management Flow */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              User Management
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <WireframeBox
                title="Profile"
                icon={<User className="w-5 h-5" />}
                color="green"
                description="User profile management"
                features={["Personal info", "Avatar upload", "Preferences"]}
              />
              <WireframeBox
                title="Change Password"
                icon={<Lock className="w-5 h-5" />}
                color="green"
                description="Security settings"
                features={["Current password", "New password", "Confirmation"]}
              />
              <WireframeBox
                title="Settings"
                icon={<Settings className="w-5 h-5" />}
                color="green"
                description="App preferences"
                features={["Notifications", "Display options", "Data export"]}
              />
              <WireframeBox
                title="Forgot Password"
                icon={<Lock className="w-5 h-5" />}
                color="green"
                description="Password recovery"
                features={["Email input", "Reset link", "Verification"]}
              />
            </div>
          </section>

          {/* Admin Flow */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Admin Panel (Proposed)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <WireframeBox
                title="Admin Dashboard"
                icon={<Shield className="w-5 h-5" />}
                color="purple"
                description="Admin overview"
                features={["User statistics", "System health", "Activity logs"]}
              />
              <WireframeBox
                title="User Management"
                icon={<User className="w-5 h-5" />}
                color="purple"
                description="Manage all users"
                features={["User list", "Edit/delete users", "Role assignment"]}
              />
              <WireframeBox
                title="Property Management"
                icon={<Building2 className="w-5 h-5" />}
                color="purple"
                description="Manage all properties"
                features={["Property list", "Bulk operations", "Data export"]}
              />
              <WireframeBox
                title="Analytics Dashboard"
                icon={<BarChart3 className="w-5 h-5" />}
                color="purple"
                description="Platform analytics"
                features={["Usage metrics", "Performance data", "Reports"]}
              />
              <WireframeBox
                title="System Settings"
                icon={<Settings className="w-5 h-5" />}
                color="purple"
                description="Platform configuration"
                features={["Global settings", "Feature flags", "Integrations"]}
              />
              <WireframeBox
                title="Audit Logs"
                icon={<FileText className="w-5 h-5" />}
                color="purple"
                description="System audit trail"
                features={["Activity logs", "Security events", "Export logs"]}
              />
            </div>
          </section>

          {/* User Journey Summary */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Journey Summary</h2>
            <div className="space-y-4 text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Entry & Authentication</h3>
                  <p className="text-sm text-slate-600">
                    User lands on the platform → Signs up or logs in → Email verification
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Portfolio Management</h3>
                  <p className="text-sm text-slate-600">
                    Access Home/Portfolio dashboard → View existing properties or create new ones
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Property Analysis</h3>
                  <p className="text-sm text-slate-600">
                    Select a property → Navigate through analysis tabs (Docs, Property, Pro Forma, Capital, Plan,
                    Outlay, Returns, Analytics, Summary)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">Profile & Settings</h3>
                  <p className="text-sm text-slate-600">
                    Manage profile → Update settings → Change password → Configure preferences
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold">Admin Access (If applicable)</h3>
                  <p className="text-sm text-slate-600">
                    Admin users access admin panel → Manage users, properties, and system settings
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// Wireframe Box Component
function WireframeBox({
  title,
  icon,
  color,
  description,
  features,
  large = false,
}: {
  title: string
  icon: React.ReactNode
  color: "blue" | "green" | "purple"
  description: string
  features: string[]
  large?: boolean
}) {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    purple: "border-purple-500 bg-purple-50",
  }

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  }

  return (
    <div
      className={`border-2 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow ${
        large ? "w-full max-w-2xl" : ""
      }`}
    >
      <div className={`flex items-center gap-2 mb-3 ${iconColorClasses[color]}`}>
        {icon}
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 mb-3">{description}</p>
      <div className={`border-t-2 ${colorClasses[color]} pt-3 space-y-1`}>
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2 text-xs text-slate-700">
            <div
              className={`w-1.5 h-1.5 rounded-full ${color === "blue" ? "bg-blue-500" : color === "green" ? "bg-green-500" : "bg-purple-500"} mt-1 flex-shrink-0`}
            ></div>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
