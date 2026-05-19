"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

interface QuestionForm {
  question_text: string
  question_type: "multiple_choice" | "true_false"
  options: { text: string; is_correct: boolean }[]
}

export default function NewQuizPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_id: "",
    module_id: "",
    page_number: 1,
    passing_score: 70,
    display_order: 1,
  })

  const [questions, setQuestions] = useState<QuestionForm[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.course_id) {
      loadModules(formData.course_id)
    }
  }, [formData.course_id])

  const loadData = async () => {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_active", true)
      .order("title")

    if (coursesData) {
      setCourses(coursesData)
      if (coursesData.length > 0) {
        setFormData(prev => ({ ...prev, course_id: coursesData[0].id }))
      }
    }
    setLoading(false)
  }

  const loadModules = async (courseId: string) => {
    const { data: modulesData } = await supabase
      .from("course_modules")
      .select("id, title, display_order")
      .eq("course_id", courseId)
      .order("display_order")

    setModules(modulesData || [])
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "multiple_choice",
        options: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    if (field === "question_type" && value === "true_false") {
      updated[index] = {
        ...updated[index],
        [field]: value,
        options: [
          { text: "Verdadeiro", is_correct: true },
          { text: "Falso", is_correct: false },
        ],
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setQuestions(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    const updated = [...questions]
    if (field === "is_correct" && value === true) {
      updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
        ...opt,
        is_correct: i === oIndex,
      }))
    } else {
      updated[qIndex].options[oIndex] = {
        ...updated[qIndex].options[oIndex],
        [field]: value,
      }
    }
    setQuestions(updated)
  }

  const addOption = (qIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options.push({ text: "", is_correct: false })
    setQuestions(updated)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex)
    setQuestions(updated)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.course_id) {
      toast({ title: "Erro", description: "Preencha titulo e selecione um curso", variant: "destructive" })
      return
    }

    setSaving(true)

    try {
      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title: formData.title,
          description: formData.description || null,
          course_id: formData.course_id,
          module_id: formData.module_id || null,
          page_number: formData.page_number,
          passing_score: formData.passing_score,
          display_order: formData.display_order,
        })
        .select()
        .single()

      if (quizError) throw quizError

      // Create questions and options
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (!q.question_text.trim()) continue

        const { data: question, error: qError } = await supabase
          .from("quiz_questions")
          .insert({
            quiz_id: quiz.id,
            question_text: q.question_text,
            question_type: q.question_type,
            display_order: i + 1,
          })
          .select()
          .single()

        if (qError) throw qError

        // Create options
        const optionsToInsert = q.options
          .filter(o => o.text.trim())
          .map((o, idx) => ({
            question_id: question.id,
            option_text: o.text,
            is_correct: o.is_correct,
            display_order: idx + 1,
          }))

        if (optionsToInsert.length > 0) {
          const { error: oError } = await supabase
            .from("quiz_options")
            .insert(optionsToInsert)

          if (oError) throw oError
        }
      }

      toast({ title: "Sucesso", description: "Questionario criado com sucesso" })
      router.push("/admin/questionarios")
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao criar questionario", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
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
            <h1 className="text-2xl font-bold text-foreground">Novo Questionario</h1>
            <p className="text-sm text-muted-foreground">Crie um questionario para avaliar os alunos</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Salvar Questionario</>
          )}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes Basicas</CardTitle>
          <CardDescription>Configure os detalhes do questionario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Quiz sobre Aerodinamica"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descricao opcional do questionario"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Curso *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value, module_id: "" })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modulo (opcional)</Label>
              <Select
                value={formData.module_id}
                onValueChange={(value) => setFormData({ ...formData, module_id: value })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione o modulo" /></SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pagina do Curso</Label>
              <Input
                type="number"
                value={formData.page_number}
                onChange={(e) => setFormData({ ...formData, page_number: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Nota Minima (%)</Label>
              <Input
                type="number"
                value={formData.passing_score}
                onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 70 })}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Ordem de Exibicao</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas</CardTitle>
          <CardDescription>Adicione as perguntas e opcoes de resposta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-foreground">Pergunta {qIndex + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Texto da Pergunta *</Label>
                <Textarea
                  value={question.question_text}
                  onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                  placeholder="Digite a pergunta..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={question.question_type}
                  onValueChange={(value) => updateQuestion(qIndex, "question_type", value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multipla Escolha</SelectItem>
                    <SelectItem value="true_false">Verdadeiro ou Falso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Opcoes de Resposta</Label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={option.is_correct}
                        onCheckedChange={(checked) => updateOption(qIndex, oIndex, "is_correct", checked)}
                      />
                      <span className="text-xs text-muted-foreground w-14">
                        {option.is_correct ? "Correta" : "Errada"}
                      </span>
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, "text", e.target.value)}
                      placeholder={`Opcao ${oIndex + 1}`}
                      className="flex-1"
                      disabled={question.question_type === "true_false"}
                    />
                    {question.question_type === "multiple_choice" && question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                {question.question_type === "multiple_choice" && question.options.length < 6 && (
                  <Button variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Opcao
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addQuestion} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
