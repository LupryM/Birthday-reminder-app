"use client"

import { MoreHorizontal, Calendar, Gift, MessageSquare, ShoppingBag, Settings } from "lucide-react"
import { AvatarRing } from "@/components/avatar-ring"
import { Button } from "@/components/ui/button"
import { type Person, formatBirthdayFull, getDaysUntilBirthday, isBirthdayToday } from "@/lib/data"

interface ProfileViewProps {
  person: Person & { role?: string }
  isOwnProfile: boolean
  onViewWishlist: () => void
  onBack?: () => void
  onEdit?: () => void
  onSendMessage?: () => void
}

export function ProfileView({ person, isOwnProfile, onViewWishlist, onBack, onEdit, onSendMessage }: ProfileViewProps) {
  const daysUntil = getDaysUntilBirthday(person.birthday)
  const isToday = isBirthdayToday(person.birthday)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        {onBack ? (
          <button onClick={onBack} className="text-primary font-medium">
            Back
          </button>
        ) : (
          <div />
        )}
        <span className="text-foreground font-medium">Profile</span>
        {isOwnProfile && onEdit ? (
          <button onClick={onEdit} className="p-2 text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </button>
        ) : (
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Profile Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-8">
        {/* Avatar with ring */}
        <AvatarRing src={person.avatar} alt={person.name} size="xl" showRing />

        {/* Name and age */}
        <h1 className="text-2xl font-semibold text-foreground mt-5">{person.name}</h1>
        {person.role && <p className="text-primary text-sm font-medium mt-0.5">{person.role}</p>}
        <p className="text-muted-foreground mt-1">{person.age} yrs old</p>

        {/* Birthday info card */}
        <div className="w-full mt-8 space-y-4">
          <div className="flex items-center gap-4 bg-card rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Birthday</p>
              <p className="text-foreground font-medium">{formatBirthdayFull(person.birthday)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Birthday status</p>
              {isToday ? (
                <p className="text-primary font-medium">Today!</p>
              ) : (
                <p className="text-foreground font-medium">{daysUntil} days away</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full mt-8 space-y-3">
          {isOwnProfile ? (
            <Button
              onClick={onViewWishlist}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium"
            >
              <Gift className="w-5 h-5 mr-2" />
              Manage My Wishlist
            </Button>
          ) : (
            /* Message button now calls onSendMessage */
            <Button
              variant="outline"
              onClick={onSendMessage}
              className="w-full h-12 border-border bg-card hover:bg-secondary text-foreground rounded-xl font-medium"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Send message
            </Button>
          )}
        </div>

        {/* Buy gift button at bottom */}
        {!isOwnProfile && (
          <div className="w-full mt-auto pb-24 pt-8">
            <Button
              onClick={onViewWishlist}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              View Wishlist
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
