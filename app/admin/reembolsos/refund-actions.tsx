"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
} from "@/components/ui/alert-dialog"

interface RefundActionsProps {
  refundId: string
  studentName: string
  courseName: string
}

export default function RefundActions({
  refundId,
  studentName,
  courseName,
}: RefundActionsProps) {
  const router = useRouter()
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: "approved" | "rejected") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error("Erro ao processar reembolso")
      }

      router.refresh()
    } catch (error) {
      console.error("Error processing refund:", error)
      alert("Erro ao processar reembolso")
    } finally {
      setLoading(false)
      setShowApproveDialog(false)
      setShowRejectDialog(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => setShowApproveDialog(true)}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRejectDialog(true)}
          disabled={loading}
          className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
        >
          Rejeitar
        </Button>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Reembolso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar o reembolso de{" "}
              <strong>{studentName}</strong> para o curso{" "}
              <strong>{courseName}</strong>?<br />
              <br />
              <span className="text-yellow-600 font-medium">
                O usuário será automaticamente desmatriculado do curso.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("approved")}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? "Processando..." : "Aprovar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Reembolso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar o reembolso de{" "}
              <strong>{studentName}</strong> para o curso{" "}
              <strong>{courseName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("rejected")}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? "Processando..." : "Rejeitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
