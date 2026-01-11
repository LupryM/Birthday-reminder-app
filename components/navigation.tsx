"use client"

import { Home, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationProps {
  activeTab: "home" | "profile" | "friends"
  onTabChange: (tab: "home" | "profile" | "friends") => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "home" as const, label: "Birthdays", icon: Home },
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "friends" as const, label: "Apes", icon: Users },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center py-3 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon
              className={cn("w-6 h-6 transition-transform", activeTab === tab.id && "scale-110")}
              strokeWidth={activeTab === tab.id ? 2.5 : 1.5}
            />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
