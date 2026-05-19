import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const INFINITYPAY_HANDLE = process.env.INFINITYPAY_HANDLE || "drxbackup"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { orderNsu, transactionNsu, slug } = await req.json()

    if (!orderNsu) {
      return NextResponse.json({ error: "order_nsu é obrigatório" }, { status: 400 })
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("id, user_id, status")
      .eq("order_nsu", orderNsu)
      .single()

    if (!payment || payment.user_id !== user.id) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 })
    }

    const verifyRes = await fetch("https://api.checkout.infinitepay.io/payment_check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: INFINITYPAY_HANDLE,
        order_nsu: orderNsu,
        transaction_nsu: transactionNsu,
        slug,
      }),
    })

    const data = await verifyRes.json()

    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: "Erro ao verificar pagamento", details: data },
        { status: 400 },
      )
    }

    if (data.paid && payment.status !== "completed") {
      const admin = createAdminClient()
      const { data: fullPayment } = await admin
        .from("payments")
        .select("*")
        .eq("order_nsu", orderNsu)
        .single()

      if (fullPayment) {
        await admin
          .from("payments")
          .update({
            status: "completed",
            metadata: {
              ...(fullPayment.metadata as object),
              verified_at: new Date().toISOString(),
              capture_method: data.capture_method,
              installments: data.installments,
              paid_amount: data.paid_amount,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", fullPayment.id)

        await admin
          .from("enrollments")
          .update({
            status: "active",
            enrolled_at: new Date().toISOString(),
          })
          .eq("user_id", fullPayment.user_id)
          .eq("course_id", fullPayment.course_id)
      }
    }

    return NextResponse.json({
      success: data.success,
      paid: data.paid,
      amount: data.amount,
      paidAmount: data.paid_amount,
      installments: data.installments,
      captureMethod: data.capture_method,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno"
    console.error("[InfinityPay Verify] Error:", err)
    return NextResponse.json({ error: "Erro interno", details: message }, { status: 500 })
  }
}
