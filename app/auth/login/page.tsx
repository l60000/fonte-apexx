"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()

      const { error, data } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        let errorMessage = "Erro ao fazer login"
        if (
          error.message === "Invalid login credentials" ||
          error.code === "invalid_credentials"
        ) {
          errorMessage =
            "Email ou senha incorretos. Se o usuario foi criado no Supabase, marque 'Auto Confirm User' e defina a senha no painel."
        } else if (
          error.message.includes("Email not confirmed") ||
          error.code === "email_not_confirmed"
        ) {
          errorMessage =
            "Email nao confirmado. No Supabase: Authentication → Users → confirme o usuario ou execute scripts/018_sync_auth_users_profiles.sql"
        } else if (error.message.includes("Database error")) {
          errorMessage =
            "Erro no banco ao autenticar. Execute scripts/018_sync_auth_users_profiles.sql no Supabase."
        } else if (error.message.includes("Network")) {
          errorMessage = "Erro de rede. Verifique sua conexao e tente novamente em alguns instantes."
        } else {
          errorMessage = error.message
        }
        setError(errorMessage)
        setLoading(false)
        return
      }

      if (!data.session) {
        setError("Sessao nao criada. Verifique confirmacao de email no Supabase.")
        setLoading(false)
        return
      }

      await fetch("/api/auth/ensure-profile", { method: "POST" })

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError("Erro inesperado ao fazer login. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex justify-center mb-4">
            <Image
              src="/apexxlogo.png"
              alt="APEXX Logo"
              width={140}
              height={46}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <CardTitle className="text-2xl font-heading">Entrar na sua conta</CardTitle>
          <CardDescription>
            Digite seu email e senha para acessar o curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Ainda nao tem uma conta?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Voltar para o inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
