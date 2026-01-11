"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AvatarRing } from "@/components/avatar-ring";
import {
  type Person,
  getDaysUntilBirthday,
  formatBirthday,
  isBirthdayToday,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface FriendsGridProps {
  friends: Person[];
  onSelectFriend: (friend: Person) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0 },
};

export function FriendsGrid({ friends, onSelectFriend }: FriendsGridProps) {
  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">The Apes</h2>
            <p className="text-sm text-muted-foreground">
              {friends.length} members
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search apes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 bg-card border-border rounded-2xl h-12"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {filteredFriends.map((friend) => {
          const days = getDaysUntilBirthday(friend.birthday);
          const isToday = isBirthdayToday(friend.birthday);
          const isSoon = days <= 30;

          return (
            <motion.button
              key={friend.id}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectFriend(friend)}
              className={cn(
                "flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border transition-all hover:border-primary/50 min-h-[180px]",
                isToday && "border-primary bg-primary/5",
                isSoon && !isToday && "border-primary/30"
              )}
            >
              <div className="relative">
                <AvatarRing
                  src={friend.avatar}
                  alt={friend.name}
                  size="lg"
                  showRing={isToday || isSoon}
                />
                {isToday && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                    }}
                    className="absolute -bottom-1 -right-1 text-lg"
                  >
                    🎂
                  </motion.div>
                )}
              </div>
              <div className="text-center w-full">
                <p className="font-semibold text-foreground text-sm truncate max-w-full">
                  {friend.name}
                </p>
                {friend.role && (
                  <p className="text-xs text-primary truncate mt-0.5">
                    {friend.role}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBirthday(friend.birthday)}
                </p>

                <div className="mt-3">
                  {isToday ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      Today!
                    </span>
                  ) : isSoon ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                      {days} days
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {days} days
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {filteredFriends.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-card mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No apes found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search
          </p>
        </motion.div>
      )}
    </div>
  );
}
