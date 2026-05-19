"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, CheckCircle, FileCheck, Clock } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function StudentFinalExamPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours in seconds

  useEffect(() => {
    loadExam()
  }, [])

  useEffect(() => {
    if (!exam || exam.completed_at || result) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [exam, result])

  const loadExam = async () => {
    try {
      // Check if user already has an attempt
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user has completed the course (100% progress)
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("progress_percentage, courses(total_pages)")
        .eq("user_id", user.id)
        .eq("course_id", params.courseId)
        .eq("status", "active")
        .single()

      if (!enrollment) {
        toast({
          title: "Acesso Negado",
          description: "Você precisa estar matriculado no curso",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      // Check if all pages have been read (progress is 100%)
      if (enrollment.progress_percentage < 100) {
        toast({
          title: "Prova Bloqueada",
          description: "Você precisa completar todas as páginas do curso antes de fazer a prova final",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      const { data: existingAttempt } = await supabase
        .from("final_exam_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", params.courseId)
        .single()

      if (existingAttempt) {
        setExam(existingAttempt)
        setQuestions(existingAttempt.questions_data || [])

        if (existingAttempt.completed_at) {
          setResult({
            score: existingAttempt.score,
            total: existingAttempt.total_questions,
            percentage: existingAttempt.percentage,
            passed: existingAttempt.passed,
          })
        }
      } else {
        const response = await fetch("/api/final-exam/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: params.courseId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao gerar prova")
        }

        const { data: newExam } = await supabase
          .from("final_exam_attempts")
          .select("*")
          .eq("id", data.examId)
          .single()

        setExam(newExam)
        setQuestions(data.questions || [])
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }))
  }

  const handleSubmit = async () => {
    if (!exam) return

    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0) {
      const confirmed = confirm(
        `Você tem ${unanswered} questão(ões) não respondida(s). Deseja enviar mesmo assim?`
      )
      if (!confirmed) return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/final-exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: exam.id,
          answers,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar respostas")
      }

      const resultData = await response.json()
      setResult(resultData)

      toast({
        title: resultData.passed ? "Parabéns!" : "Resultado",
        description: resultData.passed 
          ? `Você foi aprovado com ${resultData.percentage}%!`
          : `Você obteve ${resultData.percentage}%. Necessário 60% para aprovação.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (result) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Card className={`border-2 ${result.passed ? "border-green-500" : "border-red-500"}`}>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              {result.passed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-center text-2xl">
              {result.passed ? "Aprovado!" : "Reprovado"}
            </CardTitle>
            <CardDescription className="text-center">
              Resultado da Prova Final
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className={`text-6xl font-bold ${result.passed ? "text-green-500" : "text-red-500"}`}>
                {result.percentage}%
              </p>
              <p className="text-muted-foreground mt-2">
                {result.score} de {result.total} questões corretas
              </p>
            </div>

            <Progress value={result.percentage} className="h-3" />

            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                {result.passed 
                  ? "Você atingiu a nota mínima de 60% e está aprovado! Seu certificado será emitido em breve."
                  : "Você não atingiu a nota mínima de 60%. Continue estudando e tente novamente."}
              </p>
            </div>

            <div className="flex gap-4">
              <Button asChild className="flex-1">
                <a href="/dashboard">Voltar ao Dashboard</a>
              </Button>
              {result.passed && (
                <Button asChild className="flex-1" variant="outline">
                  <a href="/dashboard/certificado">Ver Certificado</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileCheck className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Prova Final</h1>
                <p className="text-sm text-muted-foreground">
                  {answeredCount} de {questions.length} questões respondidas
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-mono font-bold text-foreground">
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-muted-foreground">Tempo restante</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-4" />
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">
                Questão {index + 1} de {questions.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground font-medium">{question.question}</p>
              
              <RadioGroup
                value={answers[index] || ""}
                onValueChange={(value) => handleAnswerChange(index, value)}
              >
                {["A", "B", "C", "D"].map((option) => (
                  <div key={option} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-secondary/50">
                    <RadioGroupItem value={option} id={`q${index}-${option}`} />
                    <Label htmlFor={`q${index}-${option}`} className="flex-1 cursor-pointer">
                      <span className="font-semibold mr-2">{option})</span>
                      {question[`option_${option.toLowerCase()}`]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <Card className="sticky bottom-4 bg-card/95 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4 mr-2" />
                Enviar Prova
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Você precisa de 60% de acertos para ser aprovado
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
