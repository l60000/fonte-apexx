"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Save, Loader2, CheckCircle, AlertCircle, Users, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Statistic {
  id: string
  key: string
  value: string
  label: string | null
}

interface StudentPerformance {
  id: string
  full_name: string
  email: string
  progress_percentage: number
  last_access: string
  total_pages_read: number
  quizzes_completed: number
  average_quiz_score: number
}

export default function AdminEstatisticasPage() {
  const [stats, setStats] = useState<Statistic[]>([])
  const [students, setStudents] = useState<StudentPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      // Load site stats
      const { data: statsData } = await supabase
        .from("site_statistics")
        .select("*")
        .order("key")
      
      if (statsData) {
        setStats(statsData)
      }

      // Load student performance
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select(`
          id,
          progress_percentage,
          last_page_accessed,
          updated_at,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .order("progress_percentage", { ascending: false })

      if (enrollmentsData) {
        const studentsWithPerf = await Promise.all(
          enrollmentsData.map(async (enrollment: any) => {
            // Get total pages read
            const { count: pagesRead } = await supabase
              .from("user_page_progress")
              .select("*", { count: "exact", head: true })
              .eq("user_id", enrollment.profiles.id)

            // Get quiz attempts
            const { data: quizAttempts } = await supabase
              .from("quiz_attempts")
              .select("score, total_questions, percentage")
              .eq("user_id", enrollment.profiles.id)

            const avgScore = quizAttempts?.length 
              ? quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length 
              : 0

            return {
              id: enrollment.profiles.id,
              full_name: enrollment.profiles.full_name || "Sem nome",
              email: enrollment.profiles.email,
              progress_percentage: enrollment.progress_percentage,
              last_access: enrollment.updated_at,
              total_pages_read: pagesRead || 0,
              quizzes_completed: quizAttempts?.length || 0,
              average_quiz_score: avgScore
            }
          })
        )
        setStudents(studentsWithPerf)
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [supabase])

  const handleUpdate = (key: string, field: "value" | "label", newValue: string) => {
    setStats(prev => prev.map(stat => 
      stat.key === key ? { ...stat, [field]: newValue } : stat
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      for (const stat of stats) {
        const { error } = await supabase
          .from("site_statistics")
          .update({ value: stat.value, label: stat.label })
          .eq("key", stat.key)
        
        if (error) throw error
      }
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Erro ao salvar estatisticas")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Estatisticas do Site</h1>
          <p className="text-muted-foreground">
            Edite as estatisticas exibidas na landing page
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alteracoes
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-500 bg-green-500/10 rounded-md">
          <CheckCircle className="h-4 w-4" />
          Estatisticas atualizadas com sucesso!
        </div>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Numeros do Site
          </CardTitle>
          <CardDescription>
            Estes numeros sao exibidos na secao de estatisticas da landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div key={stat.key} className="p-4 rounded-lg bg-secondary/30 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${stat.key}-value`}>Valor ({stat.key})</Label>
                  <Input
                    id={`${stat.key}-value`}
                    value={stat.value}
                    onChange={(e) => handleUpdate(stat.key, "value", e.target.value)}
                    placeholder="Ex: 500+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${stat.key}-label`}>Descricao</Label>
                  <Input
                    id={`${stat.key}-label`}
                    value={stat.label || ""}
                    onChange={(e) => handleUpdate(stat.key, "label", e.target.value)}
                    placeholder="Ex: Alunos Formados"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Veja como as estatisticas aparecerão no site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.key} className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Performance */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Desempenho dos Alunos
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso e desempenho de cada aluno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{student.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{student.progress_percentage}%</div>
                      <p className="text-xs text-muted-foreground">Progresso</p>
                    </div>
                  </div>
                  
                  <Progress value={student.progress_percentage} className="h-2 mb-4" />
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 rounded bg-secondary/50">
                      <div className="font-bold text-foreground">{student.total_pages_read}</div>
                      <div className="text-xs text-muted-foreground">Páginas lidas</div>
                    </div>
                    <div className="text-center p-2 rounded bg-secondary/50">
                      <div className="font-bold text-foreground">{student.quizzes_completed}</div>
                      <div className="text-xs text-muted-foreground">Questionários</div>
                    </div>
                    <div className="text-center p-2 rounded bg-secondary/50">
                      <div className="font-bold text-foreground">
                        {student.average_quiz_score > 0 ? `${student.average_quiz_score.toFixed(1)}%` : "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">Nota média</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno matriculado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
