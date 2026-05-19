import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeAnswers } from "@/lib/final-exam"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const attemptId = body.attemptId ?? body.examId
    const answersInput = body.answers

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId é obrigatório" }, { status: 400 })
    }

    const { data: attempt, error: attemptError } = await supabase
      .from("final_exam_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Tentativa de prova não encontrada" }, { status: 404 })
    }

    if (attempt.completed_at) {
      return NextResponse.json({ error: "Esta prova já foi submetida" }, { status: 400 })
    }

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("progress_percentage")
      .eq("user_id", user.id)
      .eq("course_id", attempt.course_id)
      .single()

    if (!enrollment || enrollment.progress_percentage < 100) {
      return NextResponse.json({
        error: "Você precisa completar todas as páginas do curso antes de submeter a prova",
      }, { status: 403 })
    }

    const clientQuestions = (attempt.questions_data || []) as Array<{
      question_id: string
      question: string
      option_a: string
      option_b: string
      option_c: string
      option_d: string
    }>

    if (clientQuestions.length === 0) {
      return NextResponse.json({ error: "Prova sem questões" }, { status: 500 })
    }

    const admin = createAdminClient()
    const questionIds = clientQuestions.map((q) => q.question_id)

    const { data: bankQuestions, error: bankError } = await admin
      .from("final_exam_questions")
      .select("id, correct_answer")
      .in("id", questionIds)

    if (bankError || !bankQuestions) {
      return NextResponse.json({ error: "Erro ao carregar gabarito" }, { status: 500 })
    }

    const answerMap = new Map(bankQuestions.map((q) => [q.id, q.correct_answer]))
    const userAnswers = normalizeAnswers(answersInput, clientQuestions.length)

    let correctCount = 0
    const results: Array<{
      question_number: number
      question_text: string
      correct_answer: string
      user_answer: string | null
      is_correct: boolean
    }> = []

    clientQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index] || null
      const correctAnswer = answerMap.get(question.question_id) || ""
      const isCorrect = userAnswer === correctAnswer
      if (isCorrect) correctCount++

      results.push({
        question_number: index + 1,
        question_text: question.question,
        correct_answer: correctAnswer,
        user_answer: userAnswer,
        is_correct: isCorrect,
      })
    })

    const percentage = (correctCount / clientQuestions.length) * 100
    const passed = percentage >= 60

    const { error: updateError } = await supabase
      .from("final_exam_attempts")
      .update({
        score: correctCount,
        percentage,
        passed,
        completed_at: new Date().toISOString(),
        answers: userAnswers,
      })
      .eq("id", attemptId)

    if (updateError) {
      return NextResponse.json({ error: "Erro ao salvar resultado" }, { status: 500 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    return NextResponse.json({
      score: correctCount,
      total: clientQuestions.length,
      percentage: percentage.toFixed(1),
      passed,
      results,
      studentName: profile?.full_name || profile?.email || "Aluno",
    })
  } catch (error: unknown) {
    console.error("Error submitting exam:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
