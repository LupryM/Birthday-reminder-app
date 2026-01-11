"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { AvatarRing } from "@/components/avatar-ring"
import { type Person, getDaysUntilBirthday, formatBirthday, isBirthdayToday } from "@/lib/data"
import { cn } from "@/lib/utils"

interface BirthdayListProps {
  friends: Person[]
  onSelectFriend: (friend: Person) => void
}

export function BirthdayList({ friends, onSelectFriend }: BirthdayListProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming")

  const filteredFriends = useMemo(() => {
    let result = [...friends]

    if (search) {
      result = result.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (filter === "upcoming") {
      result = result.filter((f) => getDaysUntilBirthday(f.birthday) <= 90)
    }

    return result.sort((a, b) => getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday))
  }, [friends, search, filter])

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search birthdays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border rounded-xl h-12"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["upcoming", "all"] as const).map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setFilter(tab)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]",
              filter === tab
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Birthday list */}
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout">
          {filteredFriends.map((friend, index) => {
            const days = getDaysUntilBirthday(friend.birthday)
            const isToday = isBirthdayToday(friend.birthday)

            return (
              <motion.button
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98, backgroundColor: "rgba(50, 205, 50, 0.1)" }}
                onClick={() => onSelectFriend(friend)}
                className="flex items-center gap-4 py-4 border-b border-border hover:bg-card/50 transition-colors text-left min-h-[72px]"
              >
                <AvatarRing src={friend.avatar} alt={friend.name} size="md" showRing={isToday} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{friend.name}</p>
                  {friend.role && <p className="text-xs text-primary truncate">{friend.role}</p>}
                  <p className="text-sm text-muted-foreground">{formatBirthday(friend.birthday)}</p>
                </div>
                <div className="text-right">
                  {isToday ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium"
                    >
                      Today!
                    </motion.span>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-semibold text-muted-foreground">{days}</span>
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {filteredFriends.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center text-muted-foreground"
          >
            No birthdays found
          </motion.div>
        )}
      </div>
    </div>
  )
}
