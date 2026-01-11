"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { BirthdayList } from "@/components/birthday-list";
import { ProfileView } from "@/components/profile-view";
import { WishlistView } from "@/components/wishlist-view";
import { FriendsGrid } from "@/components/friends-grid";
import { ProfileEditModal } from "@/components/profile-edit-modal";
import { ChatView } from "@/components/chat-view";
import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  birthday: string;
  role?: string;
}

interface WishlistItem {
  id: string;
  user_id: string;
  title: string;
  price: number;
  url: string | null;
  purchased: boolean;
  purchased_by: string | null;
  purchased_by_profile?: { name: string } | null;
}

interface AppMainProps {
  userId: string;
  currentProfile: Profile | null;
  allProfiles: Profile[];
  wishlistItems: WishlistItem[];
}

type ViewState =
  | { type: "home" }
  | { type: "profile" }
  | { type: "friends" }
  | { type: "friend-profile"; friend: Profile }
  | { type: "friend-wishlist"; friend: Profile; items: WishlistItem[] }
  | { type: "my-wishlist" }
  | { type: "chat"; friend: Profile };

function getAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getDaysUntilBirthday(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  const thisYear = today.getFullYear();

  let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
  if (nextBirthday < today) {
    nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function sortByUpcomingBirthday(profiles: Profile[]): Profile[] {
  return [...profiles].sort(
    (a, b) =>
      getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday)
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function AppMain({
  userId,
  currentProfile,
  allProfiles,
  wishlistItems,
}: AppMainProps) {
  const [activeTab, setActiveTab] = useState<"home" | "profile" | "friends">(
    "home"
  );
  const [viewState, setViewState] = useState<ViewState>({ type: "home" });
  const [myWishlist, setMyWishlist] = useState<WishlistItem[]>(wishlistItems);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState(currentProfile);
  const router = useRouter();
  const supabase = createClient();

  const sortedFriends = useMemo(
    () => sortByUpcomingBirthday(allProfiles),
    [allProfiles]
  );

  const upcomingBirthdaysCount = useMemo(() => {
    return allProfiles.filter((p) => getDaysUntilBirthday(p.birthday) <= 7)
      .length;
  }, [allProfiles]);

  const handleTabChange = useCallback((tab: "home" | "profile" | "friends") => {
    setActiveTab(tab);
    setViewState({ type: tab });
  }, []);

  const handleSelectFriend = useCallback(async (profile: Profile) => {
    setViewState({ type: "friend-profile", friend: profile });
  }, []);

  const handleViewFriendWishlist = useCallback(
    async (friend: Profile) => {
      const { data: items } = await supabase
        .from("wishlist_items")
        .select(
          "*, purchased_by_profile:profiles!wishlist_items_purchased_by_fkey(name)"
        )
        .eq("user_id", friend.id);

      setViewState({ type: "friend-wishlist", friend, items: items || [] });
    },
    [supabase]
  );

  const handleViewOwnWishlist = useCallback(() => {
    setViewState({ type: "my-wishlist" });
  }, []);

  const handleBack = useCallback(() => {
    setViewState({ type: activeTab });
  }, [activeTab]);

  const handleBackToFriendProfile = useCallback((friend: Profile) => {
    setViewState({ type: "friend-profile", friend });
  }, []);

  const handleSendMessage = useCallback((friend: Profile) => {
    setViewState({ type: "chat", friend });
  }, []);

  const handleTogglePurchased = async (
    itemId: string,
    currentlyPurchased: boolean
  ) => {
    if (viewState.type !== "friend-wishlist") return;

    if (currentlyPurchased) {
      await supabase
        .from("wishlist_items")
        .update({ purchased: false, purchased_by: null })
        .eq("id", itemId);
    } else {
      await supabase
        .from("wishlist_items")
        .update({ purchased: true, purchased_by: userId })
        .eq("id", itemId);
    }

    const { data: items } = await supabase
      .from("wishlist_items")
      .select(
        "*, purchased_by_profile:profiles!wishlist_items_purchased_by_fkey(name)"
      )
      .eq("user_id", viewState.friend.id);

    setViewState({ ...viewState, items: items || [] });
  };

  const handleAddItem = async (title: string, url: string, price: number) => {
    const { data: newItem } = await supabase
      .from("wishlist_items")
      .insert({
        user_id: userId,
        title,
        url: url || null,
        price,
        purchased: false,
      })
      .select()
      .single();

    if (newItem) {
      setMyWishlist((prev) => [...prev, newItem]);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from("wishlist_items").delete().eq("id", itemId);
    setMyWishlist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSaveProfile = async (updates: {
    name: string;
    birthday: string;
    role: string;
    avatar_url?: string;
  }) => {
    const updateData: Record<string, string> = {
      name: updates.name,
      birthday: updates.birthday,
      role: updates.role,
    };
    if (updates.avatar_url) {
      updateData.avatar_url = updates.avatar_url;
    }

    await supabase.from("profiles").update(updateData).eq("id", userId);

    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            name: updates.name,
            birthday: updates.birthday,
            role: updates.role,
            avatar_url: updates.avatar_url || prev.avatar_url,
          }
        : null
    );
  };

  const handleDeleteAccount = async () => {
    await supabase.from("profiles").delete().eq("id", userId);
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const user = profileData
    ? {
        id: profileData.id,
        name: profileData.name,
        avatar:
          profileData.avatar_url || "/placeholder.svg?height=120&width=120",
        birthday: new Date(profileData.birthday),
        age: getAge(profileData.birthday),
        role: profileData.role,
        wishlist: myWishlist.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          url: item.url || "",
          purchased: item.purchased,
          purchasedBy: item.purchased_by_profile?.name,
        })),
      }
    : null;

  const friends = sortedFriends.map((profile) => ({
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar_url || "/placeholder.svg?height=80&width=80",
    birthday: new Date(profile.birthday),
    age: getAge(profile.birthday),
    role: profile.role,
    wishlist: [],
  }));

  // Chat view - full screen without navigation
  if (viewState.type === "chat") {
    return (
      <ChatView
        currentUserId={userId}
        friend={{
          id: viewState.friend.id,
          name: viewState.friend.name,
          avatar:
            viewState.friend.avatar_url ||
            "/placeholder.svg?height=80&width=80",
        }}
        onBack={() => handleBackToFriendProfile(viewState.friend)}
      />
    );
  }

  // Friend profile view
  if (viewState.type === "friend-profile") {
    const friend = {
      id: viewState.friend.id,
      name: viewState.friend.name,
      avatar:
        viewState.friend.avatar_url || "/placeholder.svg?height=120&width=120",
      birthday: new Date(viewState.friend.birthday),
      age: getAge(viewState.friend.birthday),
      role: viewState.friend.role,
      wishlist: [],
    };

    return (
      <div className="min-h-screen bg-background no-pull-refresh">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.2 }}
        >
          <ProfileView
            person={friend}
            isOwnProfile={false}
            onViewWishlist={() => handleViewFriendWishlist(viewState.friend)}
            onBack={handleBack}
            onSendMessage={() => handleSendMessage(viewState.friend)}
          />
        </motion.div>
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          notificationCount={upcomingBirthdaysCount}
        />
      </div>
    );
  }

  // Friend wishlist view
  if (viewState.type === "friend-wishlist") {
    const friend = {
      id: viewState.friend.id,
      name: viewState.friend.name,
      avatar:
        viewState.friend.avatar_url || "/placeholder.svg?height=120&width=120",
      birthday: new Date(viewState.friend.birthday),
      age: getAge(viewState.friend.birthday),
      wishlist: viewState.items.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        url: item.url || "",
        purchased: item.purchased,
        purchasedBy: item.purchased_by_profile?.name,
      })),
    };

    return (
      <div className="min-h-screen bg-background no-pull-refresh">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.2 }}
        >
          <WishlistView
            person={friend}
            isOwnWishlist={false}
            onBack={() => handleBackToFriendProfile(viewState.friend)}
            onTogglePurchased={(itemId) => {
              const item = viewState.items.find((i) => i.id === itemId);
              if (item) handleTogglePurchased(itemId, item.purchased);
            }}
          />
        </motion.div>
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          notificationCount={upcomingBirthdaysCount}
        />
      </div>
    );
  }

  // Own wishlist view
  if (viewState.type === "my-wishlist" && user) {
    return (
      <div className="min-h-screen bg-background no-pull-refresh">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.2 }}
        >
          <WishlistView
            person={user}
            isOwnWishlist={true}
            onBack={handleBack}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        </motion.div>
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          notificationCount={upcomingBirthdaysCount}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-28 no-pull-refresh">
      <AppHeader userName={user.name} onLogout={handleLogout} />

      {/* Main Content with smooth transitions */}
      <main className="max-w-md mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
            >
              <BirthdayList
                friends={friends}
                onSelectFriend={(f) => {
                  const profile = sortedFriends.find((p) => p.id === f.id);
                  if (profile) handleSelectFriend(profile);
                }}
              />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
            >
              <ProfileView
                person={user}
                isOwnProfile={true}
                onViewWishlist={handleViewOwnWishlist}
                onEdit={() => setShowEditModal(true)}
              />
            </motion.div>
          )}

          {activeTab === "friends" && (
            <motion.div
              key="friends"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
            >
              <FriendsGrid
                friends={friends}
                onSelectFriend={(f) => {
                  const profile = sortedFriends.find((p) => p.id === f.id);
                  if (profile) handleSelectFriend(profile);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notificationCount={upcomingBirthdaysCount}
      />

      <AnimatePresence>
        {showEditModal && user && (
          <ProfileEditModal
            profile={user}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
