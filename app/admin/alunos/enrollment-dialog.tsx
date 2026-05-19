"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface EnrollmentDialogProps {
  studentId: string
  studentName: string
  courses: Array<{ id: string; title: string }>
  currentEnrollments: Array<{ courses: { id: string; title: string } }>
}

export default function EnrollmentDialog({
  studentId,
  studentName,
  courses,
  currentEnrollments,
}: EnrollmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const enrolledCourseIds = currentEnrollments.map((e) => e.courses.id)
  const availableCourses = courses.filter(
    (c) => !enrolledCourseIds.includes(c.id)
  )

  const handleEnroll = async () => {
    if (!selectedCourse) {
      toast({
        title: "Erro",
        description: "Selecione um curso",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: studentId,
          courseId: selectedCourse,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar matrícula")
      }

      toast({
        title: "Sucesso",
        description: "Aluno matriculado com sucesso",
      })

      setOpen(false)
      setSelectedCourse("")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao matricular aluno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="bg-transparent">
          <Plus className="w-4 h-4 mr-1" />
          Dar Acesso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conceder Acesso ao Curso</DialogTitle>
          <DialogDescription>
            Matricular {studentName} em um novo curso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableCourses.length > 0 ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione o Curso</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleEnroll}
                disabled={loading || !selectedCourse}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Matriculando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Matricular Aluno
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Este aluno já está matriculado em todos os cursos disponíveis.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
