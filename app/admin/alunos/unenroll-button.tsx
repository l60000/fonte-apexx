"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface UnenrollButtonProps {
  enrollmentId: string
  studentName: string
  courseName: string
}

export default function UnenrollButton({
  enrollmentId,
  studentName,
  courseName,
}: UnenrollButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUnenroll = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/admin/enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao remover matrícula")
      }

      toast({
        title: "Sucesso",
        description: "Aluno removido do curso com sucesso",
      })

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover aluno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive bg-transparent">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Aluno do Curso?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <strong>{studentName}</strong> do curso{" "}
            <strong>{courseName}</strong>? Esta ação não pode ser desfeita e o progresso será mantido caso o aluno seja matriculado novamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnenroll}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removendo...
              </>
            ) : (
              "Remover Aluno"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
