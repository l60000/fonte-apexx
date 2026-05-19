"use client"

import React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle, Info, DollarSign, Clock, ShieldCheck } from "lucide-react"

export default function ReembolsoPage() {
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoadingData(false)
        return
      }

      setUser(user)
      setEmail(user.email || "")
      
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || "")
      }

      // Get enrollment data to check eligibility
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("*, courses(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("enrolled_at", { ascending: false })
        .limit(1)
        .single()

      setEnrollment(enrollmentData)
      setLoadingData(false)
    }

    loadUserData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!user || !enrollment) {
      setError("Nenhuma matricula ativa encontrada")
      setLoading(false)
      return
    }

    // Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError("Senha incorreta")
      setLoading(false)
      return
    }

    // Check if enrollment is within 7 days
    const enrolledAt = new Date(enrollment.enrolled_at)
    const daysSinceEnrollment = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceEnrollment > 7) {
      setError("O prazo de 7 dias para solicitar reembolso ja expirou")
      setLoading(false)
      return
    }

    // Check if there's already a pending refund request
    const { data: existingRequest } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .eq("status", "pending")
      .single()

    if (existingRequest) {
      setError("Ja existe uma solicitacao de reembolso pendente para esta matricula")
      setLoading(false)
      return
    }

    // Create refund request
    const { error: insertError } = await supabase
      .from("refund_requests")
      .insert({
        user_id: user.id,
        enrollment_id: enrollment.id,
        reason: reason,
        status: "pending",
      })

    if (insertError) {
      console.log("[v0] Error creating refund request:", insertError)
      setError("Erro ao enviar solicitacao. Tente novamente.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reembolso</h1>
          <p className="text-muted-foreground">
            Solicite o reembolso da sua matricula
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Voce precisa estar logado para solicitar um reembolso.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reembolso</h1>
          <p className="text-muted-foreground">
            Solicite o reembolso da sua matricula
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Nenhuma matricula ativa encontrada. Voce precisa estar matriculado para solicitar reembolso.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const enrolledAt = new Date(enrollment.enrolled_at)
  const daysSinceEnrollment = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, 7 - daysSinceEnrollment)
  const isEligible = daysSinceEnrollment <= 7

  if (success) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reembolso</h1>
          <p className="text-muted-foreground">
            Solicite o reembolso da sua matricula
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Solicitacao Enviada!
              </h3>
              <p className="text-muted-foreground mb-6">
                Sua solicitacao de reembolso foi recebida e esta sendo analisada pela nossa equipe.
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    O suporte entrara em contato em ate 2 dias uteis para processar seu reembolso.
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  Voce recebera um email em <span className="font-medium text-foreground">{email}</span> com atualizacoes sobre sua solicitacao.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Solicitar Reembolso</h1>
        <p className="text-muted-foreground">
          Utilize o formulario abaixo para solicitar o reembolso da sua matricula
        </p>
      </div>

      {/* Important Notices */}
      <div className="grid md:grid-cols-2 gap-4">
        <Alert variant={isEligible ? "default" : "destructive"}>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {isEligible ? (
              <>
                <strong>Prazo de reembolso:</strong> Voce ainda tem {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''} para solicitar o reembolso.
              </>
            ) : (
              <>
                <strong>Prazo expirado:</strong> O prazo de 7 dias para reembolso ja passou.
              </>
            )}
          </AlertDescription>
        </Alert>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            <strong>Garantia:</strong> Reembolso integral de 100% do valor pago dentro do prazo de 7 dias.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Dados para Reembolso
              </CardTitle>
              <CardDescription>
                Confirme seus dados e informe o motivo do reembolso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> So e possivel solicitar reembolso se a compra foi realizada ha ate 7 dias. O suporte pode dar retorno em ate 2 dias uteis.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading || !isEligible}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    disabled={loading || !isEligible}
                    className="h-12"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="h-12 bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email da sua conta (nao pode ser alterado)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Confirme sua senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha para confirmar"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || !isEligible}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para sua seguranca, confirme sua senha
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo do reembolso *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Por favor, explique o motivo da solicitacao de reembolso..."
                    rows={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    disabled={loading || !isEligible}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Seu feedback nos ajuda a melhorar o curso
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-medium bg-primary hover:bg-primary/90"
                  disabled={loading || !isEligible}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando solicitacao...
                    </>
                  ) : (
                    "Solicitar Reembolso"
                  )}
                </Button>

                {!isEligible && (
                  <p className="text-sm text-center text-destructive">
                    O prazo de 7 dias para reembolso ja expirou
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Curso Matriculado</h4>
                <p className="text-sm text-muted-foreground">{enrollment.courses?.title || "Curso APEXX"}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-2">Data da Matricula</h4>
                <p className="text-sm text-muted-foreground">
                  {enrolledAt.toLocaleDateString("pt-BR", { 
                    day: "2-digit", 
                    month: "long", 
                    year: "numeric" 
                  })}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Politica de Reembolso</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Reembolso integral dentro de 7 dias</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Processamento em ate 2 dias uteis</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Estorno no mesmo meio de pagamento</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Sem perguntas ou burocracia</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Duvidas? Entre em contato com o suporte:
                  <a href="mailto:equipeapexx@gmail.com" className="text-primary hover:underline block mt-1">
                    equipeapexx@gmail.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
