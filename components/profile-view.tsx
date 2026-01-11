"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Gift,
  MessageSquare,
  ShoppingBag,
  Settings,
  Sparkles,
} from "lucide-react";
import { AvatarRing } from "@/components/avatar-ring";
import { Button } from "@/components/ui/button";
import {
  type Person,
  formatBirthdayFull,
  getDaysUntilBirthday,
  isBirthdayToday,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface ProfileViewProps {
  person: Person & { role?: string };
  isOwnProfile: boolean;
  onViewWishlist: () => void;
  onBack?: () => void;
  onEdit?: () => void;
  onSendMessage?: () => void;
}

export function ProfileView({
  person,
  isOwnProfile,
  onViewWishlist,
  onBack,
  onEdit,
  onSendMessage,
}: ProfileViewProps) {
  const daysUntil = getDaysUntilBirthday(person.birthday);
  const isToday = isBirthdayToday(person.birthday);

  return (
    <div className="flex flex-col min-h-screen pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/95 backdrop-blur-xl z-10">
        {onBack ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="flex items-center gap-2 text-primary font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>
        ) : (
          <div className="w-16" />
        )}
        <span className="text-foreground font-semibold">Profile</span>
        {isOwnProfile && onEdit ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {/* Profile Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative"
        >
          <AvatarRing
            src={person.avatar}
            alt={person.name}
            size="xl"
            showRing
          />
          {isToday && (
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                repeatDelay: 1,
              }}
              className="absolute -top-2 -right-2 text-3xl"
            >
              🎉
            </motion.div>
          )}
        </motion.div>

        {/* Name and age */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mt-5"
        >
          <h1 className="text-2xl font-bold text-foreground">{person.name}</h1>
          {person.role && (
            <p className="text-primary text-sm font-semibold mt-1">
              {person.role}
            </p>
          )}
          <p className="text-muted-foreground mt-1">{person.age} years old</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full mt-8 space-y-3"
        >
          <div className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Birthday
              </p>
              <p className="text-foreground font-semibold text-lg">
                {formatBirthdayFull(person.birthday)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-4 rounded-2xl p-4 border",
              isToday
                ? "bg-primary/10 border-primary/30"
                : daysUntil <= 7
                ? "bg-primary/5 border-primary/20"
                : "bg-card border-border"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isToday || daysUntil <= 7 ? "bg-primary/20" : "bg-secondary"
              )}
            >
              {isToday ? (
                <Sparkles className="w-6 h-6 text-primary" />
              ) : (
                <Gift className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Status
              </p>
              {isToday ? (
                <p className="text-primary font-bold text-lg">
                  Birthday Today! 🎂
                </p>
              ) : (
                <p
                  className={cn(
                    "font-semibold text-lg",
                    daysUntil <= 7 ? "text-primary" : "text-foreground"
                  )}
                >
                  {daysUntil} days away
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-8 space-y-3"
        >
          {isOwnProfile ? (
            <Button
              onClick={onViewWishlist}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold text-base shadow-lg shadow-primary/20"
            >
              <Gift className="w-5 h-5 mr-2" />
              Manage My Wishlist
            </Button>
          ) : (
            <>
              <Button
                onClick={onViewWishlist}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold text-base shadow-lg shadow-primary/20"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                View Wishlist
              </Button>
              <Button
                variant="outline"
                onClick={onSendMessage}
                className="w-full h-14 border-border bg-card hover:bg-secondary text-foreground rounded-2xl font-semibold text-base"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
