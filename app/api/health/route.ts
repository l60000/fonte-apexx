import { NextResponse } from "next/server"

/** Diagnóstico rápido de variáveis (sem expor valores). */
export async function GET() {
  const checks = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    INFINITYPAY_HANDLE: Boolean(
      process.env.INFINITYPAY_HANDLE || "drxbackup",
    ),
    BLOB_READ_WRITE_TOKEN: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  }

  const requiredOk =
    checks.NEXT_PUBLIC_SUPABASE_URL &&
    checks.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    checks.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    ok: requiredOk,
    message: requiredOk
      ? "Variáveis obrigatórias do Supabase configuradas."
      : "Faltam variáveis do Supabase. Veja .env.example",
    checks,
    supabaseHost: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
      /^https?:\/\//,
      "",
    ),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "(usará VERCEL_URL no deploy)",
  })
}
