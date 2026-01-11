"use client";

import { useState, useMemo } from "react";
import { Search, Cake, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { AvatarRing } from "@/components/avatar-ring";
import {
  type Person,
  getDaysUntilBirthday,
  formatBirthday,
  isBirthdayToday,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface BirthdayListProps {
  friends: Person[];
  onSelectFriend: (friend: Person) => void;
}

export function BirthdayList({ friends, onSelectFriend }: BirthdayListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

  const filteredFriends = useMemo(() => {
    let result = [...friends];

    if (search) {
      result = result.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === "upcoming") {
      result = result.filter((f) => getDaysUntilBirthday(f.birthday) <= 90);
    }

    return result.sort(
      (a, b) =>
        getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday)
    );
  }, [friends, search, filter]);

  const nextBirthday = filteredFriends[0];
  const nextBirthdayDays = nextBirthday
    ? getDaysUntilBirthday(nextBirthday.birthday)
    : null;

  return (
    <div className="flex flex-col gap-5">
      {nextBirthday && nextBirthdayDays !== null && nextBirthdayDays <= 30 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectFriend(nextBirthday)}
          className="w-full p-5 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <AvatarRing
                src={nextBirthday.avatar}
                alt={nextBirthday.name}
                size="lg"
                showRing
              />
              {isBirthdayToday(nextBirthday.birthday) && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Cake className="w-3.5 h-3.5 text-primary-foreground" />
                </motion.div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                {isBirthdayToday(nextBirthday.birthday)
                  ? "🎉 Today!"
                  : "Coming Up"}
              </p>
              <p className="font-semibold text-foreground text-lg truncate">
                {nextBirthday.name}
              </p>
              <p className="text-muted-foreground text-sm">
                {formatBirthday(nextBirthday.birthday)}
              </p>
            </div>
            <div className="text-right">
              {!isBirthdayToday(nextBirthday.birthday) && (
                <div className="flex flex-col items-center bg-card/80 rounded-2xl px-4 py-2">
                  <span className="text-3xl font-bold text-primary">
                    {nextBirthdayDays}
                  </span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              )}
            </div>
          </div>
        </motion.button>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search birthdays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 bg-card border-border rounded-2xl h-12"
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
              "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px]",
              filter === tab
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            )}
          >
            {tab === "upcoming" ? "Upcoming" : "All Birthdays"}
          </motion.button>
        ))}
      </div>

      {/* Birthday list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {filteredFriends.map((friend, index) => {
            const days = getDaysUntilBirthday(friend.birthday);
            const isToday = isBirthdayToday(friend.birthday);

            return (
              <motion.button
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectFriend(friend)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all text-left min-h-[80px]",
                  isToday && "border-primary/50 bg-primary/5"
                )}
              >
                <AvatarRing
                  src={friend.avatar}
                  alt={friend.name}
                  size="md"
                  showRing={isToday || days <= 7}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {friend.name}
                  </p>
                  {friend.role && (
                    <p className="text-xs text-primary truncate">
                      {friend.role}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatBirthday(friend.birthday)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isToday ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                    >
                      <Cake className="w-3.5 h-3.5" />
                      Today!
                    </motion.span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          days <= 7 ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {days}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        days
                      </span>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {filteredFriends.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-card mx-auto mb-4 flex items-center justify-center">
              <Cake className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              No birthdays found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
