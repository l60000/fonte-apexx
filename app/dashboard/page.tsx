import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { PlayCircle, Clock, Trophy, BookOpen } from "lucide-react"
import UpcomingLessonsSection from "@/components/dashboard/upcoming-lessons"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.is_admin || false

  // Get user enrollments (admins see all courses)
  let enrollment: any = null
  let course: any = null
  let lastPageRead = 1

  if (isAdmin) {
    // Admin: get all active courses
    const { data: courses } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .limit(1)

    course = courses?.[0]
    enrollment = course ? { courses: course, progress_percentage: 0, status: "active" } : null
  } else {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        *,
        admin_granted_access,
        courses (*)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")

    enrollment = enrollments?.[0]
    course = enrollment?.courses

    // Get last page read
    if (enrollment) {
      const { data: progress } = await supabase
        .from("user_page_progress")
        .select("page_number")
        .eq("user_id", user.id)
        .eq("course_id", course?.id)
        .order("page_number", { ascending: false })
        .limit(1)
        .maybeSingle()

      lastPageRead = progress?.page_number ? progress.page_number + 1 : 1
    }

    if (!course) {
      const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .limit(1)
      course = courses?.[0]
    }
  }

  const progressPercentage = enrollment?.progress_percentage || 0
  
  // Check if payment is completed OR admin granted access (for non-admin users)
  let hasAccess = isAdmin || false
  if (!isAdmin && enrollment) {
    // Check if admin granted manual access
    if (enrollment.admin_granted_access) {
      hasAccess = true
    } else {
      // Check payment status using user_id + course_id
      const { data: payment } = await supabase
        .from("payments")
        .select("status")
        .eq("user_id", user.id)
        .eq("course_id", course?.id)
        .eq("status", "completed")
        .limit(1)
        .maybeSingle()
      
      hasAccess = !!payment
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bem-vindo, {profile?.full_name?.split(" ")[0] || "Aluno"}!
        </h1>
        <p className="text-muted-foreground">
          {enrollment 
            ? "Continue de onde voce parou e avance no seu aprendizado."
            : "Voce ainda nao esta matriculado em nenhum curso."}
        </p>
      </div>

      {enrollment ? (
        <>
          {/* Progress Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {course?.title || "Curso"}
              </CardTitle>
              <CardDescription>Seu progresso no curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso geral</span>
                  <span className="font-medium text-foreground">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex gap-4 pt-4">
                  {hasAccess ? (
                    <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href={`/dashboard/curso/${course?.id}?page=${lastPageRead}`}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Continuar Assistindo
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex-1 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-sm text-yellow-600 dark:text-yellow-500">
                        Aguardando confirmacao de pagamento para liberar acesso
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">0h</p>
                    <p className="text-sm text-muted-foreground">Tempo de estudo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <PlayCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Aulas concluidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {progressPercentage >= 100 ? "Sim" : "Nao"}
                    </p>
                    <p className="text-sm text-muted-foreground">Certificado disponivel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* No enrollment - Show CTA */
        <Card className="bg-card border-primary/30">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Comece sua jornada no automobilismo
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Matricule-se agora e tenha acesso a conteudo exclusivo 
                sobre pilotagem e automobilismo de alta performance.
              </p>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/cursos">
                  Ver Cursos Disponiveis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity / Next Lessons */}
      <UpcomingLessonsSection 
        enrollmentId={hasAccess ? enrollment?.id : undefined} 
        courseId={course?.id} 
      />
    </div>
  )
}
