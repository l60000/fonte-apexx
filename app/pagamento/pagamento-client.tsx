"use client"

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

import { useEffect, useState } from "react"

import { useToast } from "@/hooks/use-toast"

const features = [
  "Acesso vitalicio a todo o conteudo",
  "6 modulos completos",
  "Certificado digital verificavel",
  "Suporte direto com o instrutor",
]

export default function PagamentoClient() {
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
                      <>
                        Pagar R${" "}
                        {displayPrice.toFixed(2).replace(".", ",")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}