"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationToggleProps {
  compact?: boolean;
}

export function NotificationToggle({
  compact = false,
}: NotificationToggleProps) {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setSupported("Notification" in window && "serviceWorker" in navigator);
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported || permission === "granted") return;

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        // Show test notification
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification("Rise of the Apes", {
          body: "You'll be notified about upcoming birthdays!",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          vibrate: [100, 50, 100],
        });
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  const isEnabled = permission === "granted";
  const isDenied = permission === "denied";

  if (compact) {
    return (
      <motion.button
        onClick={requestPermission}
        disabled={isDenied || loading || isEnabled}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "p-2.5 rounded-xl transition-colors",
          isEnabled
            ? "text-primary bg-primary/10"
            : isDenied
            ? "text-muted-foreground opacity-50 cursor-not-allowed"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isEnabled ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={requestPermission}
      disabled={isDenied || loading}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-4 w-full p-4 rounded-2xl border transition-all min-h-[64px]",
        isEnabled
          ? "bg-primary/10 border-primary/30"
          : isDenied
          ? "bg-secondary border-border opacity-60 cursor-not-allowed"
          : "bg-card border-border hover:border-primary/50"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isEnabled ? "bg-primary/20" : "bg-secondary"
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
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </motion.div>
          ) : showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <Check className="w-5 h-5 text-primary" />
            </motion.div>
          ) : isEnabled ? (
            <motion.div
              key="enabled"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Bell className="w-5 h-5 text-primary" />
            </motion.div>
          ) : isDenied ? (
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
        </AnimatePresence>
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <p
          className={cn(
            "font-medium",
            isEnabled ? "text-primary" : "text-foreground"
          )}
        >
          {isEnabled
            ? "Notifications Enabled"
            : isDenied
            ? "Notifications Blocked"
            : "Enable Notifications"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isEnabled
            ? "You'll get birthday reminders"
            : isDenied
            ? "Enable in browser settings"
            : "Get reminders for upcoming birthdays"}
        </p>
      </div>

      {/* Status indicator */}
      {isEnabled && <div className="w-2 h-2 rounded-full bg-primary" />}
    </motion.button>
  );
}
