import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlayCircle, Clock } from "lucide-react"

interface UpcomingLessonsSectionProps {
  enrollmentId?: string
  courseId?: string
}

export default async function UpcomingLessonsSection({ enrollmentId, courseId }: UpcomingLessonsSectionProps) {
  const supabase = await createClient()
  
  let lessons: any[] = []

  // Show upcoming lessons ONLY for enrolled users with both enrollmentId AND courseId
  if (enrollmentId && courseId) {
    const { data } = await supabase
      .from("upcoming_lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("display_order", { ascending: true })
      .limit(3)

    lessons = data || []
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Proximas aulas</CardTitle>
        <CardDescription>
          {enrollmentId 
            ? "Continue seu aprendizado com as proximas aulas recomendadas"
            : "Faca sua matricula para ter acesso as aulas"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enrollmentId && lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/dashboard/curso/${courseId}?page=${lesson.page_number}`}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">{lesson.module_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {lesson.duration_minutes} min
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {enrollmentId 
              ? "Nenhuma aula configurada ainda. Entre em contato com o suporte."
              : "Nenhuma aula disponivel. Faca sua matricula para comecar."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
