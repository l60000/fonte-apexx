"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-destructive/30">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pagamento Cancelado
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Sua tentativa de pagamento foi cancelada.
            </p>
            <p className="text-sm text-muted-foreground">
              Nenhuma cobrança foi realizada.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-foreground mb-4">O que aconteceu?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Você cancelou o processo de pagamento antes de concluí-lo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Nenhuma cobrança foi feita no seu cartão
                </span>
              </li>
              <li className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Você pode tentar novamente quando quiser
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/cursos">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar para Cursos
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">
                Ir para Home
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Precisa de ajuda?{" "}
            <Link href="/contato" className="text-primary hover:underline">
              Entre em contato
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
