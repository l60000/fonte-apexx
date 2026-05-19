import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { TermsChecker } from "@/components/dashboard/terms-checker"
import { ensureProfileForUser } from "@/lib/auth/ensure-profile"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    try {
      await ensureProfileForUser(user)
      const { data: syncedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
      profile = syncedProfile
    } catch (syncError) {
      console.error("[dashboard] Error syncing profile:", syncError)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />
      <div className="flex">
        <DashboardSidebar isAdmin={profile?.is_admin || false} />
        <main className="flex-1 p-6 lg:p-8 pt-20 lg:ml-64">
          {children}
        </main>
      </div>
      <TermsChecker userId={user.id} />
    </div>
  )
}
