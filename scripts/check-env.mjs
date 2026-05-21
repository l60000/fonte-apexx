import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const envPath = resolve(root, ".env.local")

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
]

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const env = loadEnvFile(envPath)
const hasEnvFile = existsSync(envPath)

// Verifica se as variáveis estão disponíveis (arquivo .env.local OU process.env)
const missing = required.filter((key) => {
  const v = env[key] || process.env[key]
  return !v || v.includes("COLE_AQUI")
})

// Se não tem arquivo .env.local E também não tem variáveis no process.env, erro
if (!hasEnvFile && missing.length > 0) {
  // Verifica se está rodando em ambiente com variáveis injetadas (v0, Vercel, etc)
  const hasAnyEnvVar = required.some((key) => process.env[key])
  
  if (!hasAnyEnvVar) {
    console.error("\n❌ Arquivo .env.local não encontrado.")
    console.error("   Copie:  copy .env.example .env.local")
    console.error("   Preencha as chaves do Supabase e rode npm run dev de novo.\n")
    process.exit(1)
  }
}

if (missing.length > 0) {
  console.error("\n❌ Variáveis ausentes ou ainda com placeholder:")
  for (const key of missing) console.error(`   - ${key}`)
  console.error(
    "\n   Supabase → Project Settings → API → anon public + service_role\n",
  )
  process.exit(1)
}

const source = hasEnvFile ? ".env.local" : "environment"
console.log(`✓ Variáveis do Supabase OK (${source})`)
