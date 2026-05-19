import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-heading">Erro de Autenticacao</CardTitle>
          <CardDescription>
            Ocorreu um problema durante o processo de autenticacao
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Isso pode ter acontecido porque o link de confirmacao expirou ou ja foi utilizado.
            Por favor, tente novamente.
          </p>
          
          <div className="pt-4 space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Tentar Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/sign-up">
                Criar nova conta
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                Voltar para o inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
