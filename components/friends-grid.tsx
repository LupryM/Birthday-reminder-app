"use client"

import { motion } from "framer-motion"
import { AvatarRing } from "@/components/avatar-ring"
import { type Person, getDaysUntilBirthday, formatBirthday, isBirthdayToday } from "@/lib/data"
import { cn } from "@/lib/utils"

interface FriendsGridProps {
  friends: Person[]
  onSelectFriend: (friend: Person) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
}

export function FriendsGrid({ friends, onSelectFriend }: FriendsGridProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">The Apes</h2>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {friends.map((friend) => {
          const days = getDaysUntilBirthday(friend.birthday)
          const isToday = isBirthdayToday(friend.birthday)
          const isSoon = days <= 30

          return (
            <motion.button
              key={friend.id}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectFriend(friend)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border transition-all hover:border-primary/50 min-h-[160px]",
                isSoon && "border-primary/30 bg-primary/5",
              )}
            >
              <AvatarRing src={friend.avatar} alt={friend.name} size="lg" showRing={isToday || isSoon} />
              <div className="text-center w-full">
                <p className="font-medium text-foreground text-sm truncate max-w-full">{friend.name}</p>
                {friend.role && <p className="text-xs text-primary truncate mt-0.5">{friend.role}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{formatBirthday(friend.birthday)}</p>
                {isToday ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                  >
                    Today!
                  </motion.span>
                ) : isSoon ? (
                  <span className="inline-block mt-2 text-primary text-xs font-medium">{days} days</span>
                ) : (
                  <span className="inline-block mt-2 text-muted-foreground text-xs">{days} days</span>
                )}
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
