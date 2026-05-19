import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const INFINITYPAY_HANDLE = process.env.INFINITYPAY_HANDLE || "drxbackup"

async function confirmPayment(orderNsu: string) {
  const supabase = createAdminClient()

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("order_nsu", orderNsu)
    .single()

  if (paymentError || !payment) {
    return { ok: false as const, status: 400, message: "Pedido não encontrado" }
  }

  if (payment.status === "completed") {
    return { ok: true as const, status: 200, message: null }
  }

  const verifyRes = await fetch("https://api.checkout.infinitepay.io/payment_check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: INFINITYPAY_HANDLE,
      order_nsu: orderNsu,
    }),
  })

  const verifyData = await verifyRes.json()
  if (!verifyRes.ok || !verifyData.paid) {
    console.error("[InfinityPay Webhook] Payment not confirmed:", verifyData)
    return { ok: false as const, status: 400, message: "Pagamento não confirmado" }
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id)

  if (updateError) {
    console.error("[InfinityPay Webhook] Error updating payment:", updateError)
    return { ok: false as const, status: 400, message: "Erro ao atualizar pagamento" }
  }

  await supabase
    .from("enrollments")
    .update({
      status: "active",
      enrolled_at: new Date().toISOString(),
    })
    .eq("user_id", payment.user_id)
    .eq("course_id", payment.course_id)

  return { ok: true as const, status: 200, message: null }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    console.log("[InfinityPay Webhook] Received order_nsu:", payload?.order_nsu)

    const { order_nsu: orderNsu } = payload

    if (!orderNsu) {
      return NextResponse.json(
        { success: false, message: "order_nsu ausente" },
        { status: 400 },
      )
    }

    const result = await confirmPayment(orderNsu)

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status },
      )
    }

    return NextResponse.json({ success: true, message: null })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno"
    console.error("[InfinityPay Webhook] Error:", error)
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
