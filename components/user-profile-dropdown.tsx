"use client"

import { useRouter } from "next/navigation"
import { Settings, CreditCard, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

// CLERK BYPASSED - using mock user data for v0 Vercel compatibility

export function UserProfileDropdown({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()
  
  // Mock user data
  const mockUser = {
    fullName: "John Doe",
    email: "john.doe@example.com"
  }

  if (!isOpen) return null

  const handleSettingsClick = () => {
    onClose()
    router.push("/user")
  }

  const handleLogout = () => {
    // Just redirect to home when logging out
    onClose()
    router.push("/")
  }

  const menuItems = [
    {
      icon: Settings,
      label: "Settings",
      onClick: handleSettingsClick,
    },
    { icon: CreditCard, label: "Billing" },
    { icon: HelpCircle, label: "Help" },
  ]

  return (
    <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-48">
      <div className="px-3 py-2 border-b border-gray-100 mb-1">
        <div className="text-sm font-medium text-gray-900">{mockUser.fullName}</div>
        <div className="text-xs text-gray-500">{mockUser.email}</div>
      </div>

      <div className="space-y-1">
        {menuItems.map(({ icon: Icon, label, onClick }) => (
          <Button
            key={label}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-normal hover:bg-gray-50"
            onClick={onClick}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}

        <div className="border-t border-gray-100 mt-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-normal hover:bg-gray-50 text-red-600 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
