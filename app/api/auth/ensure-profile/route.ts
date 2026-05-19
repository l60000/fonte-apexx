import { createClient } from "@/lib/supabase/server"
import { ensureProfileForUser } from "@/lib/auth/ensure-profile"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const result = await ensureProfileForUser(user)
    return NextResponse.json({ ok: true, ...result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao sincronizar perfil"
    console.error("[ensure-profile]", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
