import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { toClientQuestions } from "@/lib/final-exam"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "courseId é obrigatório" }, { status: 400 })
    }

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, progress_percentage, status")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "active")
      .single()

    if (!enrollment) {
      return NextResponse.json({ error: "Acesso negado ao curso" }, { status: 403 })
    }

    if (enrollment.progress_percentage < 100) {
      return NextResponse.json({
        error: "Você precisa completar todas as páginas do curso antes de fazer a prova final",
      }, { status: 403 })
    }

    const { data: existingAttempt } = await supabase
      .from("final_exam_attempts")
      .select("id, questions_data, completed_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle()

    if (existingAttempt) {
      return NextResponse.json({
        examId: existingAttempt.id,
        questions: existingAttempt.questions_data || [],
        alreadyExists: true,
      })
    }

    const admin = createAdminClient()
    const { data: allQuestions, error: questionsError } = await admin
      .from("final_exam_questions")
      .select("id, question_text, option_a, option_b, option_c, option_d")

    if (questionsError || !allQuestions || allQuestions.length < 30) {
      return NextResponse.json({
        error: "Erro ao carregar banco de questões. Execute os scripts SQL no Supabase.",
      }, { status: 500 })
    }

    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, 30)
    const questionsData = toClientQuestions(selectedQuestions)

    const { data: attempt, error: attemptError } = await supabase
      .from("final_exam_attempts")
      .insert({
        user_id: user.id,
        course_id: courseId,
        enrollment_id: enrollment.id,
        questions_data: questionsData,
        total_questions: 30,
      })
      .select("id")
      .single()

    if (attemptError || !attempt) {
      console.error("Error creating exam attempt:", attemptError)
      return NextResponse.json({ error: "Erro ao criar tentativa de prova" }, { status: 500 })
    }

    return NextResponse.json({
      examId: attempt.id,
      questions: questionsData,
    })
  } catch (error: unknown) {
    console.error("Error generating exam:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
