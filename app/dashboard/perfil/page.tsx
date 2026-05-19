"use client"

import React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setEmail(user.email || "")
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          
        if (profile) {
          setFullName(profile.full_name || "")
          setPhone(profile.phone || "")
        }
      }
      
      setLoading(false)
    }
    
    loadProfile()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError("Usuario nao autenticado")
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", user.id)

    if (error) {
      setError("Erro ao salvar perfil")
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informacoes pessoais
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informacoes Pessoais
          </CardTitle>
          <CardDescription>
            Atualize seus dados de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-500 bg-green-500/10 rounded-md">
                <CheckCircle className="h-4 w-4" />
                Perfil atualizado com sucesso!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  className="pl-10"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O email nao pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alteracoes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Seguranca</CardTitle>
          <CardDescription>
            Gerencie a seguranca da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Alterar senha</p>
                <p className="text-sm text-muted-foreground">
                  Ultima alteracao: nunca
                </p>
              </div>
              <Button variant="outline" size="sm">
                Alterar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
