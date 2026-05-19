import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlayCircle, Lock, CheckCircle, Clock, BookOpen, FileText } from "lucide-react"

export default async function AulasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.is_admin || false

  // Admins have access to all courses, regular users need enrollment
  let isEnrolled = false
  let enrolledCourseIds: string[] = []

  if (isAdmin) {
    isEnrolled = true
    // Admin sees all courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select("id")
      .eq("is_active", true)
    enrolledCourseIds = allCourses?.map((c) => c.id) || []
  } else {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", user.id)
      .eq("status", "active")

    enrolledCourseIds = enrollments?.map((e) => e.course_id) || []
    isEnrolled = enrolledCourseIds.length > 0
  }

  // Load courses the user has access to
  let courses: any[] = []
  if (isEnrolled && enrolledCourseIds.length > 0) {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .in("id", enrolledCourseIds)
      .eq("is_active", true)
    courses = data || []
  }

  // Load modules and lessons for each course from the database
  let modules: any[] = []
  if (courses.length > 0) {
    const courseIds = courses.map((c) => c.id)

    const { data: dbModules } = await supabase
      .from("course_modules")
      .select("*")
      .in("course_id", courseIds)
      .order("order_index", { ascending: true })

    if (dbModules && dbModules.length > 0) {
      const moduleIds = dbModules.map((m) => m.id)

      const { data: dbLessons } = await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("order_index", { ascending: true })

      // Load lesson progress for the user
      const { data: lessonProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)

      const progressMap: Record<string, boolean> = {}
      lessonProgress?.forEach((p) => {
        progressMap[p.lesson_id] = p.completed
      })

      modules = dbModules.map((mod) => ({
        ...mod,
        courseName: courses.find((c) => c.id === mod.course_id)?.title || "",
        lessons: (dbLessons || [])
          .filter((l) => l.module_id === mod.id)
          .map((l) => ({
            ...l,
            completed: progressMap[l.id] || false,
          })),
      }))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Aulas</h1>
        <p className="text-muted-foreground">
          {isEnrolled 
            ? "Acesse todos os modulos e aulas do curso"
            : "Faca sua matricula para ter acesso completo"}
        </p>
      </div>

      {isEnrolled ? (
        <div className="space-y-6">
          {/* Course PDFs */}
          {courses.map((course) => (
            <Card key={course.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {course.title}
                    </CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                  {course.total_pages > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {course.total_pages} paginas
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href={`/dashboard/curso/${course.id}`}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Abrir Curso
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Modules from database */}
          {modules.length > 0 ? (
            modules.map((module, moduleIndex) => {
              const completedCount = module.lessons.filter((l: any) => l.completed).length
              const totalCount = module.lessons.length

              return (
                <Card key={module.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          Modulo {moduleIndex + 1}: {module.title}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">
                          {completedCount}/{totalCount} aulas
                        </span>
                        {totalCount > 0 && (
                          <div className="w-20 h-1.5 bg-secondary rounded-full mt-1">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {lesson.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <PlayCircle className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {moduleIndex + 1}.{lessonIndex + 1} - {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {lesson.duration_minutes && (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.duration_minutes} min</span>
                                  </>
                                )}
                                {lesson.completed && (
                                  <span className="text-green-500 text-xs">Concluido</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {module.lessons.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma aula adicionada neste modulo
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : courses.length > 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Os modulos do curso serao adicionados em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Conteudo Bloqueado
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Voce ainda nao esta matriculado no curso. Faca sua matricula para ter 
                acesso a todas as aulas e materiais complementares.
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
    </div>
  )
}
