"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical, Save, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface UpcomingLesson {
  id: string
  course_id: string
  title: string
  module_name: string
  page_number: number
  duration_minutes: number
  display_order: number
  item_type: "lesson" | "quiz"
  quiz_id?: string
}

interface Course {
  id: string
  title: string
}

export default function UpcomingLessonsAdminPage() {
  const [lessons, setLessons] = useState<UpcomingLesson[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<UpcomingLesson | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    module_name: "",
    page_number: 1,
    duration_minutes: 45,
    item_type: "lesson" as "lesson" | "quiz",
    quiz_id: "",
  })
  
  const [quizzes, setQuizzes] = useState<any[]>([])

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Load courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (coursesData) {
      setCourses(coursesData)
      if (coursesData.length > 0 && !formData.course_id) {
        setFormData(prev => ({ ...prev, course_id: coursesData[0].id }))
      }
    }

    // Load lessons
    const { data: lessonsData } = await supabase
      .from("upcoming_lessons")
      .select("*")
      .order("display_order", { ascending: true })

    if (lessonsData) {
      setLessons(lessonsData)
    }

    // Load quizzes
    const { data: quizzesData } = await supabase
      .from("quizzes")
      .select("id, title, course_id")
      .order("title", { ascending: true })

    if (quizzesData) {
      setQuizzes(quizzesData)
    }

    setLoading(false)
  }

  const handleSubmit = async () => {
    console.log("[v0] handleSubmit called with formData:", formData)
    
    if (!formData.title || !formData.course_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    // Validate quiz selection if item_type is quiz
    if (formData.item_type === "quiz" && !formData.quiz_id) {
      toast({
        title: "Erro",
        description: "Selecione um questionário",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      if (editingLesson) {
        // Update
        const updateData = {
          title: formData.title,
          module_name: formData.module_name,
          page_number: formData.page_number,
          duration_minutes: formData.duration_minutes,
          course_id: formData.course_id,
          item_type: formData.item_type,
          quiz_id: formData.item_type === "quiz" ? formData.quiz_id : null,
        }
        
        console.log("[v0] Updating lesson:", editingLesson.id, updateData)
        
        const { error } = await supabase
          .from("upcoming_lessons")
          .update(updateData)
          .eq("id", editingLesson.id)

        if (error) {
          console.error("[v0] Update error:", error)
          throw error
        }

        toast({
          title: "Sucesso",
          description: "Aula atualizada com sucesso",
        })
      } else {
        // Create
        const maxOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.display_order)) : 0

        const insertData = {
          title: formData.title,
          module_name: formData.module_name,
          page_number: formData.page_number,
          duration_minutes: formData.duration_minutes,
          course_id: formData.course_id,
          item_type: formData.item_type,
          quiz_id: formData.item_type === "quiz" ? formData.quiz_id : null,
          display_order: maxOrder + 1,
        }
        
        console.log("[v0] Creating lesson:", insertData)

        const { error, data } = await supabase
          .from("upcoming_lessons")
          .insert(insertData)
          .select()

        if (error) {
          console.error("[v0] Insert error:", error)
          throw error
        }
        
        console.log("[v0] Insert success:", data)

        toast({
          title: "Sucesso",
          description: "Aula adicionada com sucesso",
        })
      }

      setIsDialogOpen(false)
      setEditingLesson(null)
      setFormData({
        course_id: courses[0]?.id || "",
        title: "",
        module_name: "",
        page_number: 1,
        duration_minutes: 45,
        item_type: "lesson",
        quiz_id: "",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta aula?")) return

    const { error } = await supabase
      .from("upcoming_lessons")
      .delete()
      .eq("id", id)

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Aula removida com sucesso",
      })
      loadData()
    }
  }

  const handleEdit = (lesson: UpcomingLesson) => {
    setEditingLesson(lesson)
    setFormData({
      course_id: lesson.course_id,
      title: lesson.title,
      module_name: lesson.module_name,
      page_number: lesson.page_number,
      duration_minutes: lesson.duration_minutes,
      item_type: lesson.item_type || "lesson",
      quiz_id: lesson.quiz_id || "",
    })
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingLesson(null)
    setFormData({
      course_id: courses[0]?.id || "",
      title: "",
      module_name: "",
      page_number: 1,
      duration_minutes: 45,
      item_type: "lesson",
      quiz_id: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Próximas Aulas</h1>
          <p className="text-muted-foreground">Gerencie as aulas exibidas no dashboard dos alunos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Aula
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Editar Aula" : "Nova Aula"}</DialogTitle>
              <DialogDescription>
                Configure a aula que será exibida no dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course">Curso *</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemType">Tipo de Item *</Label>
                <Select
                  value={formData.item_type}
                  onValueChange={(value: "lesson" | "quiz") => setFormData({ ...formData, item_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Aula</SelectItem>
                    <SelectItem value="quiz">Questionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.item_type === "quiz" ? (
                <div className="space-y-2">
                  <Label htmlFor="quiz">Selecionar Questionário *</Label>
                  <Select
                    value={formData.quiz_id}
                    onValueChange={(value) => {
                      const selectedQuiz = quizzes.find(q => q.id === value)
                      setFormData({ 
                        ...formData, 
                        quiz_id: value,
                        title: selectedQuiz?.title || formData.title,
                        course_id: selectedQuiz?.course_id || formData.course_id
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o questionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.filter(q => q.course_id === formData.course_id).map((quiz) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Aula *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Introdução à Aerodinâmica"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module">Nome do Módulo *</Label>
                    <Input
                      id="module"
                      value={formData.module_name}
                      onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
                      placeholder="Ex: Módulo 2"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page">Número da Página *</Label>
                  <Input
                    id="page"
                    type="number"
                    min="1"
                    value={formData.page_number}
                    onChange={(e) => setFormData({ ...formData, page_number: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 45 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose} className="bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aulas Configuradas</CardTitle>
          <CardDescription>
            Lista de aulas que aparecem na seção "Próximas Aulas" do dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : lessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma aula configurada. Adicione a primeira aula acima.
            </p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    <div>
                      <p className="font-medium text-foreground">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.module_name} • Página {lesson.page_number} • {lesson.duration_minutes} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(lesson)}
                      className="bg-transparent"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(lesson.id)}
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
