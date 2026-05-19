import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Award, DollarSign, TrendingUp, Clock } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get statistics
  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", false)

  const { count: totalEnrollments } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })

  const { count: totalCertificates } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })

  const { count: pendingRefunds } = await supabase
    .from("refund_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get recent enrollments
  const { data: recentEnrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      profiles (full_name, email),
      courses (title)
    `)
    .order("enrolled_at", { ascending: false })
    .limit(5)

  const stats = [
    { 
      label: "Total de Alunos", 
      value: totalStudents || 0, 
      icon: Users,
      change: "+12% este mes"
    },
    { 
      label: "Matriculas Ativas", 
      value: totalEnrollments || 0, 
      icon: BookOpen,
      change: "+8% este mes"
    },
    { 
      label: "Certificados Emitidos", 
      value: totalCertificates || 0, 
      icon: Award,
      change: "+5% este mes"
    },
    { 
      label: "Reembolsos Pendentes", 
      value: pendingRefunds || 0, 
      icon: DollarSign,
      change: pendingRefunds && pendingRefunds > 0 ? "Requer atencao" : "Nenhum pendente"
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Visao geral do desempenho da plataforma
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Matriculas Recentes</CardTitle>
            <CardDescription>Ultimos alunos matriculados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEnrollments && recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {recentEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {enrollment.profiles?.full_name || enrollment.profiles?.email || "Aluno"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {enrollment.courses?.title || "Curso"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(enrollment.enrolled_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma matricula recente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
            <CardDescription>Tarefas comuns de administracao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Adicionar Aluno", href: "/admin/alunos", icon: Users },
                { label: "Novo Curso", href: "/admin/cursos", icon: BookOpen },
                { label: "Emitir Certificado", href: "/admin/certificados", icon: Award },
                { label: "Ver Reembolsos", href: "/admin/reembolsos", icon: DollarSign },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-center"
                >
                  <action.icon className="w-6 h-6 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
