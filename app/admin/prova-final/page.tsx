"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, CheckCircle, Download } from "lucide-react"

export default function AdminFinalExamPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [attempts, setAttempts] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    const { count } = await supabase
      .from("final_exam_questions")
      .select("*", { count: "exact", head: true })

    setTotalQuestions(count || 0)

    const { data: attemptsData } = await supabase
      .from("final_exam_attempts")
      .select(`
        *,
        profiles (full_name, email),
        courses (title)
      `)
      .order("completed_at", { ascending: false })
      .limit(20)

    if (attemptsData) {
      setAttempts(attemptsData)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Prova Final</h1>
        <p className="text-muted-foreground">
          Gerencie o banco de questoes e acompanhe os resultados dos alunos
        </p>
      </div>

      {/* Question Bank Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Banco de Questoes
          </CardTitle>
          <CardDescription>
            Sistema de prova final com 240 questoes de multipla escolha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-3xl font-bold text-primary">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total de Questoes</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="text-3xl font-bold text-foreground">30</div>
              <div className="text-sm text-muted-foreground">Questoes por Prova</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="text-3xl font-bold text-foreground">60%</div>
              <div className="text-sm text-muted-foreground">Nota Minima</div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Como Funciona
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>O sistema possui um banco com 240 questoes de multipla escolha sobre pilotagem</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Para cada aluno, sao sorteadas 30 questoes aleatorias do banco</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>O aluno precisa de no minimo 18 acertos (60%) para ser aprovado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Os resultados aparecem em tempo real nesta pagina para acompanhamento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">5.</span>
                <span>Cada aluno so pode fazer a prova uma vez por curso</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="w-full" asChild>
              <a href="/240_questoes_pilotagem.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF com todas as 240 Questoes
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exam Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados das Provas</CardTitle>
          <CardDescription>
            Ultimas 20 tentativas de prova final dos alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length > 0 ? (
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/20"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {attempt.profiles?.full_name || attempt.profiles?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {attempt.courses?.title}
                    </p>
                    {attempt.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(attempt.completed_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${attempt.passed ? "text-green-500" : "text-red-500"}`}>
                        {attempt.percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.score}/{attempt.total_questions} acertos
                      </p>
                    </div>
                    <div>
                      {attempt.passed ? (
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                          Aprovado
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium">
                          Reprovado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma tentativa de prova ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
