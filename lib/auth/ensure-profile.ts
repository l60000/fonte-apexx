import { createAdminClient } from "@/lib/supabase/admin"
import type { User } from "@supabase/supabase-js"

/** Garante linha em public.profiles para o usuário autenticado (auth.users → profiles). */
export async function ensureProfileForUser(user: User) {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existing) {
    return { created: false, profileId: existing.id }
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    ""

  const { data: profile, error } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      is_admin: Boolean(user.user_metadata?.is_admin),
    })
    .select("id")
    .single()

  if (error) {
    throw error
  }

  return { created: true, profileId: profile.id }
}
