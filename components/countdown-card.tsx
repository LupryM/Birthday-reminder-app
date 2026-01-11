"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gift, Sparkles } from "lucide-react"
import { type Friend, getDaysUntilBirthday, getHoursUntilBirthday, formatBirthday } from "@/lib/data"

interface CountdownCardProps {
  friend: Friend
  onViewWishlist: () => void
}

export function CountdownCard({ friend, onViewWishlist }: CountdownCardProps) {
  const [days, setDays] = useState(getDaysUntilBirthday(friend.birthday))
  const [hours, setHours] = useState(getHoursUntilBirthday(friend.birthday))

  useEffect(() => {
    const interval = setInterval(() => {
      setDays(getDaysUntilBirthday(friend.birthday))
      setHours(getHoursUntilBirthday(friend.birthday))
    }, 1000 * 60) // Update every minute

    return () => clearInterval(interval)
  }, [friend.birthday])

  return (
    <Card className="relative overflow-hidden bg-card border border-border rounded-3xl p-6 shadow-sm">
      <div className="absolute top-4 right-4">
        <Sparkles className="w-5 h-5 text-accent/60" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16 border-2 border-accent/20">
          <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
          <AvatarFallback className="bg-accent/10 text-accent text-lg font-semibold">
            {friend.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-muted-foreground text-sm font-medium">Next Birthday</p>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">{friend.name}</h2>
          <p className="text-muted-foreground text-sm">{formatBirthday(friend.birthday)}</p>
        </div>
      </div>

      <div className="flex items-end justify-between mb-6">
        <div className="flex gap-6">
          <div>
            <p className="text-5xl font-bold tracking-tighter text-foreground">{days}</p>
            <p className="text-muted-foreground text-sm font-medium">days</p>
          </div>
          <div>
            <p className="text-5xl font-bold tracking-tighter text-foreground">{hours}</p>
            <p className="text-muted-foreground text-sm font-medium">hours</p>
          </div>
        </div>
      </div>

      <button
        onClick={onViewWishlist}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-2xl font-medium transition-all hover:opacity-90 active:scale-[0.98]"
      >
        <Gift className="w-5 h-5" />
        View Wishlist
      </button>
    </Card>
  )
}
