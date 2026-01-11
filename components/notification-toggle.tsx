"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported("Notification" in window && "serviceWorker" in navigator)
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!supported) return

    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        // Show test notification
        const registration = await navigator.serviceWorker.ready
        registration.showNotification("Rise of the Apes", {
          body: "Notifications enabled! You'll be notified about upcoming birthdays.",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          vibrate: [100, 50, 100],
        })
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  const isEnabled = permission === "granted"
  const isDenied = permission === "denied"

  return (
    <motion.button
      onClick={requestPermission}
      disabled={isDenied || loading}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex items-center gap-3 w-full p-4 rounded-2xl border transition-colors min-h-[56px]",
        isEnabled
          ? "bg-primary/10 border-primary/30 text-primary"
          : isDenied
            ? "bg-secondary border-border text-muted-foreground opacity-50 cursor-not-allowed"
            : "bg-card border-border text-foreground hover:border-primary/50",
      )}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </motion.div>
        ) : isEnabled ? (
          <motion.div
            key="enabled"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Bell className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="disabled"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <BellOff className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 text-left">
        <p className="font-medium text-sm">
          {isEnabled ? "Notifications On" : isDenied ? "Notifications Blocked" : "Enable Notifications"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isEnabled
            ? "You'll be notified about birthdays"
            : isDenied
              ? "Enable in browser settings"
              : "Get reminders for upcoming birthdays"}
        </p>
      </div>
    </motion.button>
  )
}
