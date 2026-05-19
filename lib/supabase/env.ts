/** Variáveis públicas do Supabase (seguras no navegador). */
export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""
  return { url, anonKey }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv()
  return url.length > 0 && anonKey.length > 0
}

export const SUPABASE_ENV_HINT =
  "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local (local) ou em Vercel → Settings → Environment Variables, depois faça redeploy."
