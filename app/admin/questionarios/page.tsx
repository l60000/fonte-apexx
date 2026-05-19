import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, HelpCircle } from "lucide-react"
import Link from "next/link"

export default async function QuizzesPage() {
  const supabase = await createClient()

  // Get all courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })

  // Get all quizzes with course and module info
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      courses (title),
      course_modules (title),
      quiz_questions (id)
    `)
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Questionários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie questionários e avalie o aprendizado dos alunos
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/questionarios/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Questionário
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Questionários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{quizzes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cursos com Questionários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(quizzes?.map(q => q.course_id)).size || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Perguntas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {quizzes?.reduce((sum, q) => sum + (q.quiz_questions?.length || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes by Course */}
      {courses && courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => {
            const courseQuizzes = quizzes?.filter(q => q.course_id === course.id) || []
            
            if (courseQuizzes.length === 0) return null

            return (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    {course.title}
                  </CardTitle>
                  <CardDescription>
                    {courseQuizzes.length} questionário(s) configurado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{quiz.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {quiz.course_modules && (
                              <>
                                <span className="text-primary font-medium">{quiz.course_modules.title}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>Página {quiz.page_number}</span>
                            <span>•</span>
                            <span>{quiz.quiz_questions?.length || 0} perguntas</span>
                            <span>•</span>
                            <span>Nota mínima: {quiz.passing_score}%</span>
                          </div>
                          {quiz.description && (
                            <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild className="bg-transparent">
                            <Link href={`/admin/questionarios/${quiz.id}`}>
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Editar
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum questionário criado ainda
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/admin/questionarios/novo">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Questionário
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
