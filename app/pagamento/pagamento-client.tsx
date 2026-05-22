"use client"

import { Suspense, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Check,
  Shield,
  Clock,
  CreditCard,
  QrCode,
  Flag,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const features = [
  "Acesso vitalicio a todo o conteudo",
  "6 modulos completos",
  "Certificado digital verificavel",
  "Suporte direto com o instrutor",
]

function PagamentoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [user, setUser] = useState<{
    id: string
    email: string
    name?: string
  } | null>(null)

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const courseId = searchParams.get("courseId")

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push(
          "/auth/login?redirect=/pagamento" +
            (courseId ? `?courseId=${courseId}` : "")
        )
        return
      }

      // Load user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      setUser({
        id: user.id,
        email: user.email || "",
        name: profile?.full_name || user.user_metadata?.full_name,
      })

      // Load course info
      if (courseId) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single()

        if (courseData) {
          setCourse(courseData)
        }
      } else {
        const { data: courses } = await supabase
          .from("courses")
          .select("*")
          .eq("is_active", true)
          .limit(1)

        if (courses && courses.length > 0) {
          setCourse(courses[0])
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router, courseId])

  const handlePayment = async () => {
    if (!user || !course) return

    setProcessing(true)

    try {
      const response = await fetch("/api/payment/infinitypay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          courseName: course.title,
          price: course.price,
          customerName: user.name,
          customerEmail: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("URL de pagamento nao recebida")
      }
    } catch (error: any) {
      console.error("Payment error:", error)

      toast({
        title: "Erro",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      })

      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const displayPrice = course?.price || 47.99
  const originalPrice = course?.original_price || 98.99

  const discount = Math.round(
    ((originalPrice - displayPrice) / originalPrice) * 100
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Flag className="h-4 w-4 text-primary-foreground" />
            </div>

            <span className="font-display text-xl font-bold tracking-tight">
              APEXX
            </span>
          </Link>

          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Finalizar Compra
            </h1>

            <p className="text-muted-foreground">
              Complete seu pagamento para ter acesso imediato ao curso
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment */}
            <div className="lg:col-span-3">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Metodo de Pagamento
                  </CardTitle>

                  <CardDescription>
                    Pague com PIX ou Cartao de Credito
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                      <QrCode className="h-8 w-8 mx-auto text-primary mb-2" />

                      <p className="font-medium text-foreground">PIX</p>

                      <p className="text-xs text-muted-foreground">
                        Pagamento instantaneo
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                      <CreditCard className="h-8 w-8 mx-auto text-primary mb-2" />

                      <p className="font-medium text-foreground">Cartao</p>

                      <p className="text-xs text-muted-foreground">
                        Credito ou debito
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium text-primary">
                      Voce sera redirecionado para o checkout seguro
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Escolha PIX ou Cartao na pagina de pagamento
                    </p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={processing || !course}
                    className="w-full h-14 text-base font-medium bg-primary hover:bg-primary/90"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>Pagar R$ {displayPrice.toFixed(2).replace(".", ",")}</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Pagamento seguro processado por InfinityPay
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <Card className="border-primary/30 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Flag className="h-8 w-8 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        {course?.title || "Curso"}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Acesso vitalicio
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Preco original
                      </span>

                      <span className="text-muted-foreground line-through">
                        R$ {originalPrice.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desconto</span>

                      <span className="text-primary">-{discount}%</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>

                      <div className="text-right">
                        <span className="text-3xl font-bold text-foreground">
                          R$ {displayPrice.toFixed(2).replace(".", ",")}
                        </span>

                        <p className="text-xs text-muted-foreground">
                          pagamento unico
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Garantia de 7 dias
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          Se nao gostar, devolvemos 100% do seu dinheiro
                        </p>
                      </div>
                    </div>
                  </div>

                  {user && (
                    <div className="text-sm text-muted-foreground">
                      <p>Comprando como:</p>

                      <p className="font-medium text-foreground">
                        {user.email}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function PagamentoClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PagamentoContent />
    </Suspense>
  )
}