"use client";

import { Home, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: "home" | "profile" | "friends";
  onTabChange: (tab: "home" | "profile" | "friends") => void;
  notificationCount?: number;
}

export function Navigation({
  activeTab,
  onTabChange,
  notificationCount = 0,
}: NavigationProps) {
  const tabs = [
    { id: "home" as const, label: "Birthdays", icon: Home },
    { id: "friends" as const, label: "Apes", icon: Users },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all duration-200 min-w-[80px]",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:bg-secondary"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative z-10">
                <tab.icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {tab.id === "friends" && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium relative z-10 transition-all duration-200",
                  isActive && "font-semibold"
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
