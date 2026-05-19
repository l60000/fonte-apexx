"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Key, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface GrantAccessButtonProps {
  enrollmentId: string
  studentName: string
  courseName: string
  currentAccess: boolean
}

export default function GrantAccessButton({ 
  enrollmentId, 
  studentName, 
  courseName,
  currentAccess 
}: GrantAccessButtonProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggleAccess = async () => {
    const action = currentAccess ? "revogar" : "conceder"
    const confirmed = confirm(
      `Deseja ${action} acesso manual ao curso "${courseName}" para ${studentName}?\n\n` +
      (currentAccess 
        ? "O aluno perderá acesso caso não tenha pagamento confirmado."
        : "O aluno terá acesso imediato mesmo sem pagamento confirmado.")
    )

    if (!confirmed) return

    setLoading(true)

    try {
      // Update enrollment access
      const { error } = await supabase
        .from("enrollments")
        .update({ 
          admin_granted_access: !currentAccess,
          status: !currentAccess ? "active" : "active"
        })
        .eq("id", enrollmentId)

      if (error) throw error

      // If granting access, also update/create payment as completed
      if (!currentAccess) {
        // Get enrollment details for user_id and course_id
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("user_id, course_id")
          .eq("id", enrollmentId)
          .single()

        if (enrollment) {
          // Check if payment exists
          const { data: existingPayment } = await supabase
            .from("payments")
            .select("id")
            .eq("user_id", enrollment.user_id)
            .eq("course_id", enrollment.course_id)
            .maybeSingle()

          if (existingPayment) {
            // Update existing payment to completed
            await supabase
              .from("payments")
              .update({ status: "completed", updated_at: new Date().toISOString() })
              .eq("id", existingPayment.id)
          } else {
            // Create a new payment record as completed (admin grant)
            await supabase
              .from("payments")
              .insert({
                user_id: enrollment.user_id,
                course_id: enrollment.course_id,
                status: "completed",
                amount: 0,
                payment_method: "admin_grant",
                currency: "BRL",
              })
          }
        }
      }

      toast({
        title: "Sucesso",
        description: `Acesso ${currentAccess ? "revogado" : "concedido"} com sucesso`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar acesso",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={currentAccess ? "destructive" : "default"}
      size="sm"
      onClick={handleToggleAccess}
      disabled={loading}
      className={currentAccess ? "" : "bg-green-600 hover:bg-green-700"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Key className="w-4 h-4 mr-1" />
          {currentAccess ? "Revogar Acesso" : "Conceder Acesso"}
        </>
      )}
    </Button>
  )
}
