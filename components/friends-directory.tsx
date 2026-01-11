"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Gift, Calendar } from "lucide-react"
import { type Friend, getDaysUntilBirthday, formatBirthday } from "@/lib/data"

interface FriendsDirectoryProps {
  friends: Friend[]
  onSelectFriend: (friend: Friend) => void
}

export function FriendsDirectory({ friends, onSelectFriend }: FriendsDirectoryProps) {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Friends</h2>
        <p className="text-muted-foreground">{friends.length} friends</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {friends.map((friend) => {
          const daysUntil = getDaysUntilBirthday(friend.birthday)

          return (
            <Card
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className="p-4 rounded-2xl border border-border bg-card hover:border-accent/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-lg font-semibold">
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h3 className="font-medium text-foreground truncate">{friend.name}</h3>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatBirthday(friend.birthday)}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-accent mt-2">
                  <Gift className="w-3 h-3" />
                  <span>{friend.wishlist.length} items</span>
                </div>
              </div>

              {daysUntil <= 30 && (
                <div className="mt-3 text-center">
                  <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    {daysUntil} days away
                  </span>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
