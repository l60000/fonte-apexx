import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ensureProfileForUser } from "@/lib/auth/ensure-profile"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and check admin status
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    try {
      await ensureProfileForUser(user)
      const { data: synced } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
      profile = synced
      profileError = null
    } catch {
      profileError = { message: "sync failed" } as typeof profileError
    }
  }

  if (profileError || !profile?.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 pt-20 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
