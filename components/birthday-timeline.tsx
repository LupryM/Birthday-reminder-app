"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight } from "lucide-react"
import { type Friend, getDaysUntilBirthday, formatBirthday } from "@/lib/data"

interface BirthdayTimelineProps {
  friends: Friend[]
  onSelectFriend: (friend: Friend) => void
}

export function BirthdayTimeline({ friends, onSelectFriend }: BirthdayTimelineProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground tracking-tight px-1">Upcoming</h3>
      <div className="space-y-2">
        {friends.map((friend) => {
          const daysUntil = getDaysUntilBirthday(friend.birthday)

          return (
            <button
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-accent/30 transition-all active:scale-[0.99]"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{friend.name}</p>
                <p className="text-sm text-muted-foreground">{formatBirthday(friend.birthday)}</p>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{daysUntil} days</p>
                  <p className="text-xs text-muted-foreground">{friend.wishlist.length} items</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
