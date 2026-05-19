import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabasePublicEnv, isSupabaseConfigured, SUPABASE_ENV_HINT } from "./env"

let client: SupabaseClient | null = null

/** Retorna o client ou null se as variáveis não estiverem definidas (evita crash na home). */
export function createClientIfConfigured(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (client) {
    return client
  }

  const { url, anonKey } = getSupabasePublicEnv()
  client = createBrowserClient(url, anonKey)
  return client
}

/** Exige Supabase configurado (login, dashboard, pagamento). */
export function createClient(): SupabaseClient {
  const configured = createClientIfConfigured()
  if (!configured) {
    throw new Error(SUPABASE_ENV_HINT)
  }
  return configured
}
