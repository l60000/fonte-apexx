import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAppBaseUrl } from "@/lib/app-url"

const INFINITYPAY_HANDLE = process.env.INFINITYPAY_HANDLE || "drxbackup"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, customerName, customerEmail, customerPhone } = body

    if (!courseId) {
      return NextResponse.json({ error: "courseId é obrigatório" }, { status: 400 })
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price, is_active")
      .eq("id", courseId)
      .single()

    if (courseError || !course || !course.is_active) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
    }

    const { data: activeEnrollment } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "active")
      .maybeSingle()

    if (activeEnrollment) {
      return NextResponse.json(
        { error: "Você já está matriculado neste curso" },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const orderNsu = `order_${Date.now()}_${user.id.slice(0, 8)}`
    const baseUrl = getAppBaseUrl()
    const coursePrice = Number(course.price)

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single()

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        amount: coursePrice,
        currency: "BRL",
        status: "pending",
        payment_method: "infinitypay",
        order_nsu: orderNsu,
        metadata: {
          course_name: course.title,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (paymentError) {
      console.error("[InfinityPay] Error creating payment:", paymentError)
      return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 })
    }

    const { data: existingEnrollment } = await admin
      .from("enrollments")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle()

    if (!existingEnrollment) {
      await admin.from("enrollments").insert({
        user_id: user.id,
        course_id: courseId,
        status: "pending",
        progress_percentage: 0,
      })
    } else if (existingEnrollment.status !== "active") {
      await admin
        .from("enrollments")
        .update({ status: "pending" })
        .eq("id", existingEnrollment.id)
    }

    const infinityPayload = {
      handle: INFINITYPAY_HANDLE,
      redirect_url: `${baseUrl}/pagamento/sucesso?order_nsu=${orderNsu}`,
      webhook_url: `${baseUrl}/api/payment/infinitypay/webhook`,
      order_nsu: orderNsu,
      items: [
        {
          quantity: 1,
          price: Math.round(coursePrice * 100),
          description: course.title || "Curso Online",
        },
      ],
      customer: {
        name: customerName || profile?.full_name || "Cliente",
        email: customerEmail || profile?.email || user.email,
        phone_number: customerPhone || profile?.phone || undefined,
      },
    }

    const res = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(infinityPayload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("[InfinityPay] API error:", data)
      await admin.from("payment_attempts").insert({
        payment_id: payment.id,
        user_id: user.id,
        course_id: courseId,
        status: "error",
        request_payload: infinityPayload,
        response_payload: data,
        error_message: JSON.stringify(data),
      })
      return NextResponse.json(
        { error: "Erro ao criar link de pagamento", details: data },
        { status: 400 },
      )
    }

    await admin.from("payment_attempts").insert({
      payment_id: payment.id,
      user_id: user.id,
      course_id: courseId,
      status: "success",
      request_payload: infinityPayload,
      response_payload: data,
    })

    return NextResponse.json({
      url: data.url,
      orderNsu,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno"
    console.error("[InfinityPay] Error:", err)
    return NextResponse.json({ error: "Erro interno", details: message }, { status: 500 })
  }
}
