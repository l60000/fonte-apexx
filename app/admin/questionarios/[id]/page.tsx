"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const { toast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quiz, setQuiz] = useState<any>(null)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        courses (id, title),
        course_modules (id, title)
      `)
      .eq("id", quizId)
      .single()

    if (data) {
      setQuiz(data)
    } else if (error) {
      toast({
        title: "Erro",
        description: "Questionário não encontrado",
        variant: "destructive",
      })
      router.push("/admin/questionarios")
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!quiz) return

    setSaving(true)

    const { error } = await supabase
      .from("quizzes")
      .update({
        title: quiz.title,
        description: quiz.description,
        passing_score: quiz.passing_score,
      })
      .eq("id", quizId)

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Questionário atualizado com sucesso",
      })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/questionarios">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editar Questionário</h1>
            <p className="text-sm text-muted-foreground">
              Curso: {quiz.courses?.title} {quiz.course_modules && `• Módulo: ${quiz.course_modules.title}`}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Configure os detalhes do questionário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              placeholder="Ex: Quiz de Aerodinâmica"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={quiz.description || ""}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              placeholder="Descrição opcional do questionário"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page">Página do Curso</Label>
              <Input
                id="page"
                type="number"
                value={quiz.page_number}
                onChange={(e) => setQuiz({ ...quiz, page_number: parseInt(e.target.value) })}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passing">Nota Mínima (%)</Label>
              <Input
                id="passing"
                type="number"
                value={quiz.passing_score}
                onChange={(e) => setQuiz({ ...quiz, passing_score: parseInt(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas</CardTitle>
          <CardDescription>
            Para adicionar ou editar perguntas, use a interface de gerenciamento de perguntas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Funcionalidade de edição de perguntas em desenvolvimento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
