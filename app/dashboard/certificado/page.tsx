import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, Download, Lock, ExternalLink } from "lucide-react"

export default async function CertificadoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      *,
      courses (title)
    `)
    .eq("user_id", user.id)

  // Get user's enrollments to check completion
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      courses (title)
    `)
    .eq("user_id", user.id)

  const certificate = certificates?.[0]
  const enrollment = enrollments?.[0]
  const isCompleted = enrollment?.status === "completed" || enrollment?.progress_percentage >= 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Certificado</h1>
        <p className="text-muted-foreground">
          Seu certificado de conclusao do curso
        </p>
      </div>

      {certificate ? (
        <Card className="bg-card border-primary/30">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Parabens!</CardTitle>
            <CardDescription>
              Voce concluiu o curso com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div className="p-6 rounded-xl bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Certificado de Conclusao</p>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {certificate.courses?.title || "Curso"}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>Codigo: {certificate.certificate_number}</span>
                  <span>Emitido em: {new Date(certificate.issued_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Certificado (PDF)
                </Button>
                <Button variant="outline" className="border-border bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verificar Autenticidade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : enrollment ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Certificado Ainda Nao Disponivel
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complete todas as aulas do curso para desbloquear seu certificado de conclusao.
                Voce esta em {enrollment.progress_percentage || 0}% do curso.
              </p>
              <div className="w-full max-w-xs mx-auto bg-secondary/30 rounded-full h-3 mb-6">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${enrollment.progress_percentage || 0}%` }}
                />
              </div>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard/aulas">
                  Continuar Estudando
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Nenhum Curso Encontrado
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Faca sua matricula no curso para ter acesso ao certificado de conclusao 
                apos completar todas as aulas.
              </p>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/#pricing">
                  Fazer Matricula
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Sobre o Certificado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Digital e Verificavel</h4>
              <p className="text-sm text-muted-foreground">
                Certificado digital com codigo unico para verificacao de autenticidade
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Download em PDF</h4>
              <p className="text-sm text-muted-foreground">
                Baixe seu certificado em alta resolucao para imprimir ou compartilhar
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">LinkedIn Ready</h4>
              <p className="text-sm text-muted-foreground">
                Adicione facilmente ao seu perfil do LinkedIn como credencial
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
