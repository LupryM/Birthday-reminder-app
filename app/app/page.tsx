import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppMain } from "@/components/app-main"

export default async function AppPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If no profile exists, create one from user metadata
  if (!profile) {
    const name = user.user_metadata?.name || user.email?.split("@")[0] || "User"
    const birthday = user.user_metadata?.birthday || "2000-01-01"

    await supabase.from("profiles").insert({
      id: user.id,
      name,
      birthday,
      avatar_url: null,
      role: "",
    })
  }

  // Get updated profile with role
  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get all profiles (for friends list)
  const { data: allProfiles } = await supabase.from("profiles").select("*").neq("id", user.id)

  // Get user's wishlist
  const { data: wishlistItems } = await supabase
    .from("wishlist_items")
    .select("*, purchased_by_profile:profiles!wishlist_items_purchased_by_fkey(name)")
    .eq("user_id", user.id)

  return (
    <AppMain
      userId={user.id}
      currentProfile={currentProfile}
      allProfiles={allProfiles || []}
      wishlistItems={wishlistItems || []}
    />
  )
}
