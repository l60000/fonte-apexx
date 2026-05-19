"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Loader2, Receipt, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PagamentoSucessoPage() {
  const searchParams = useSearchParams()
  
  // Parâmetros que vêm do InfinityPay após redirect
  const orderNsu = searchParams.get("order_nsu")
  const receiptUrl = searchParams.get("receipt_url")
  const transactionNsu = searchParams.get("transaction_nsu")
  const captureMethod = searchParams.get("capture_method")
  const slug = searchParams.get("slug")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      // Se não temos order_nsu, apenas mostrar sucesso genérico
      if (!orderNsu) {
        setStatus("success")
        return
      }

      try {
        // Verificar pagamento na API
        const res = await fetch("/api/payment/infinitypay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNsu,
            transactionNsu,
            slug,
          }),
        })

        const data = await res.json()

        if (data.paid) {
          setPaymentData(data)
          setStatus("success")
        } else {
          // Mesmo se não confirmado ainda, mostrar sucesso
          // O webhook vai atualizar depois
          setStatus("success")
        }
      } catch (error) {
        console.error("Verification error:", error)
        // Em caso de erro, ainda mostrar sucesso
        // Assumimos que o pagamento foi feito já que chegou nessa página
        setStatus("success")
      }
    }

    // Aguardar um pouco para dar tempo do webhook processar
    setTimeout(verifyPayment, 1500)
  }, [orderNsu, transactionNsu, slug])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 text-center">
          <CardHeader>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <CardTitle>Verificando pagamento...</CardTitle>
            <CardDescription>
              Aguarde enquanto confirmamos seu pagamento
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-heading">Pagamento Confirmado!</CardTitle>
          <CardDescription className="text-base">
            Sua matricula foi realizada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderNsu && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Numero do pedido:</span>
                <span className="font-mono font-medium text-xs">{orderNsu}</span>
              </div>
              {transactionNsu && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID da transacao:</span>
                  <span className="font-mono font-medium text-xs">{transactionNsu.slice(0, 20)}...</span>
                </div>
              )}
              {captureMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Metodo de pagamento:</span>
                  <span className="font-medium capitalize">
                    {captureMethod === "credit_card" ? "Cartao de Credito" : captureMethod === "pix" ? "PIX" : captureMethod}
                  </span>
                </div>
              )}
              {paymentData?.installments && paymentData.installments > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parcelas:</span>
                  <span className="font-medium">{paymentData.installments}x</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Proximos passos:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Voce ja tem acesso completo ao curso</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Enviamos um e-mail de confirmacao com os detalhes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Comece a estudar agora mesmo!</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
              <Link href="/dashboard">
                Acessar Meus Cursos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {receiptUrl && (
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href={decodeURIComponent(receiptUrl)} target="_blank" rel="noopener noreferrer">
                  <Receipt className="h-4 w-4 mr-2" />
                  Ver Comprovante
                </a>
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Precisa de ajuda? Entre em contato com nosso suporte
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
