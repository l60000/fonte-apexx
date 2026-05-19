"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Check, ShieldCheck, Clock } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function MatriculaPage() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("curso")
  
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [cpf, setCpf] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [awaitingPayment, setAwaitingPayment] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [currentOrderNsu, setCurrentOrderNsu] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Poll for payment confirmation
  useEffect(() => {
    if (!awaitingPayment || !currentOrderNsu) return

    const interval = setInterval(async () => {
      const { data: payment } = await supabase
        .from("payments")
        .select("status")
        .eq("order_nsu", currentOrderNsu)
        .maybeSingle()

      if (payment?.status === "completed") {
        setPaymentConfirmed(true)
        setAwaitingPayment(false)
        clearInterval(interval)
        setTimeout(() => router.push("/dashboard"), 3000)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [awaitingPayment, currentOrderNsu, supabase, router])

  useEffect(() => {
    const loadData = async () => {
      // Check user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setEmail(user.email || "")
        setFullName(user.user_metadata?.full_name || "")
      }

      // Load course if courseId is provided
      if (courseId) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single()
        
        setCourse(courseData)
      }

      setCheckingAuth(false)
    }
    loadData()
  }, [supabase, courseId])

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return value
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "")
    return numbers.length === 11
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate CPF
    if (!validateCPF(cpf)) {
      setError("CPF invalido. Digite um CPF valido com 11 digitos")
      setLoading(false)
      return
    }

    // Validate birth date (must be 18+)
    const birthDateObj = new Date(birthDate)
    const today = new Date()
    const age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      if (age - 1 < 18) {
        setError("Voce deve ter pelo menos 18 anos para se matricular")
        setLoading(false)
        return
      }
    } else if (age < 18) {
      setError("Voce deve ter pelo menos 18 anos para se matricular")
      setLoading(false)
      return
    }

    if (!user) {
      setError("Por favor, faca login primeiro")
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

    const cId = courseId || course?.id

    if (!cId || !course) {
      setError("Curso não encontrado")
      setLoading(false)
      return
    }

    const { data: activeEnrollment } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("course_id", cId)
      .eq("status", "active")
      .maybeSingle()

    if (activeEnrollment) {
      setError("Você já está matriculado neste curso!")
      setLoading(false)
      setTimeout(() => router.push("/dashboard"), 2000)
      return
    }

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        cpf: cpf.replace(/\D/g, ""),
      })
      .eq("id", user.id)

    try {
      const res = await fetch("/api/payment/infinitypay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: cId,
          customerName: fullName,
          customerEmail: email,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar link de pagamento")
      }

      if (!data.url) {
        throw new Error("Link de pagamento não retornado")
      }

      window.open(data.url, "_blank")
      setCurrentOrderNsu(data.orderNsu)
      setAwaitingPayment(true)
      setLoading(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar pagamento"
      setError(message)
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!currentOrderNsu) {
      setError("Order NSU is missing")
      return
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("status")
      .eq("order_nsu", currentOrderNsu)
      .maybeSingle()

    if (payment?.status === "completed") {
      setPaymentConfirmed(true)
      setAwaitingPayment(false)
      setTimeout(() => router.push("/dashboard"), 3000)
    } else {
      setError("Pagamento ainda não confirmado")
    }
  }

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/30 text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
            <CardDescription className="text-base">
              Sua matricula foi realizada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Voce sera redirecionado para o dashboard em instantes...
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Acessar Meus Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (awaitingPayment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Aguardando Pagamento</CardTitle>
            <CardDescription className="text-base">
              Complete o pagamento na aba que foi aberta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 text-left space-y-2">
              <p className="text-sm text-muted-foreground">
                Uma nova aba foi aberta com a pagina de pagamento do InfinityPay.
              </p>
              <p className="text-sm text-muted-foreground">
                Apos concluir o pagamento, esta pagina sera atualizada automaticamente.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 animate-pulse" />
              <span>Verificando pagamento automaticamente...</span>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                supabase
                  .from("payments")
                  .select("metadata")
                  .eq("order_nsu", currentOrderNsu)
                  .maybeSingle()
                  .then(({ data }) => {
                    if (data?.metadata?.checkout_url) {
                      window.open(data.metadata.checkout_url, "_blank")
                    }
                  })
              }}
            >
              Reabrir pagina de pagamento
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">Conta necessaria</CardTitle>
            <CardDescription>
              Voce precisa ter uma conta para se matricular
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Crie sua conta gratuitamente ou faca login para continuar com a matricula
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/auth/sign-up">Criar Conta</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">Ja tenho conta</Link>
              </Button>
            </div>
            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Voltar para o inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Confirmar Matricula
            </h1>
            <p className="text-muted-foreground">
              Preencha seus dados para confirmar a matricula no curso APEXX
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Dados da Matricula</CardTitle>
                  <CardDescription>
                    Confirme suas informacoes para prosseguir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome completo *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
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
                        disabled={loading}
                        className="h-12"
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-muted-foreground">
                        Voce deve ter pelo menos 18 anos
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={handleCPFChange}
                        required
                        disabled={loading}
                        className="h-12"
                        maxLength={14}
                      />
                      <p className="text-xs text-muted-foreground">
                        Necessario para emissao do certificado
                      </p>
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
                        disabled={loading}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">
                        Para sua seguranca, confirme sua senha
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base font-medium bg-primary hover:bg-primary/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Prosseguir para Pagamento"
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Ao prosseguir, voce concorda com nossos termos de servico
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="border-primary/30 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {course ? (
                    <>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">Acesso vitalicio</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{course.module_count || 6} modulos completos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">Certificado digital</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">Suporte direto</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        {course.original_price && (
                          <>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-sm text-muted-foreground">Preco original</span>
                              <span className="text-sm text-muted-foreground line-through">
                                R$ {course.original_price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-baseline mb-4">
                              <span className="text-sm text-muted-foreground">Desconto</span>
                              <span className="text-sm text-primary font-medium">
                                -{Math.round((1 - course.price / course.original_price) * 100)}%
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-baseline pt-2 border-t border-border">
                          <span className="font-semibold text-foreground">Total</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-foreground">
                              R$ {course.price?.toFixed(2)}
                            </span>
                            <p className="text-xs text-muted-foreground">pagamento unico</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Garantia de 7 dias</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          100% do seu dinheiro de volta
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Acesso Imediato</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Comece a estudar agora mesmo
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
