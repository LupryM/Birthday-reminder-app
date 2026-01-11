"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  userName: string;
  onLogout: () => void;
}

export function AppHeader({ userName, onLogout }: AppHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-xl z-40 border-b border-border safe-area-top">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-xl">🦍</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Rise of the Apes
              </h1>
              <p className="text-xs text-muted-foreground">
                Welcome, {userName.split(" ")[0]}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(true)}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Bell className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Settings/Notification Sheet */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>

              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">
                    Quick Settings
                  </h2>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Notification setting */}
                  <SettingsItem
                    icon={<Bell className="w-5 h-5" />}
                    label="Notifications"
                    description="Get birthday reminders"
                    onClick={() => {
                      if ("Notification" in window) {
                        Notification.requestPermission();
                      }
                    }}
                  />

                  {/* Logout */}
                  <SettingsItem
                    icon={<LogOut className="w-5 h-5" />}
                    label="Log Out"
                    description="Sign out of your account"
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    destructive
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  destructive?: boolean;
}

function SettingsItem({
  icon,
  label,
  description,
  onClick,
  destructive,
}: SettingsItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors text-left",
        destructive && "hover:bg-destructive/10"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          destructive
            ? "bg-destructive/20 text-destructive"
            : "bg-primary/20 text-primary"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "font-medium",
            destructive ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.button>
  );
}
