import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { action } = await request.json()

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }

    // Get refund request details
    const { data: refundRequest } = await supabase
      .from("refund_requests")
      .select("*, enrollments(id)")
      .eq("id", params.id)
      .single()

    if (!refundRequest) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    // Update refund status
    const { error: updateError } = await supabase
      .from("refund_requests")
      .update({
        status: action,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (updateError) {
      throw updateError
    }

    // If approved, automatically unenroll the user
    if (action === "approved" && refundRequest.enrollments?.id) {
      const { error: deleteError } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", refundRequest.enrollments.id)

      if (deleteError) {
        console.error("Error deleting enrollment:", deleteError)
        // Don't fail the whole operation if enrollment deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message:
        action === "approved"
          ? "Reembolso aprovado e usuário desmatriculado"
          : "Reembolso rejeitado",
    })
  } catch (error: any) {
    console.error("Error processing refund:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
