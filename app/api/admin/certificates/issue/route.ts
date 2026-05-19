import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { userId, courseId } = body

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (existingCert) {
      return NextResponse.json(
        { error: "Certificate already exists for this user and course" },
        { status: 400 }
      )
    }

    // Generate unique certificate number
    const certificateNumber = `APEXX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create certificate
    const { data: certificate, error } = await supabase
      .from("certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_number: certificateNumber,
        issued_by: user.id,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating certificate:", error)
      return NextResponse.json(
        { error: "Failed to create certificate" },
        { status: 500 }
      )
    }

    // Update enrollment to completed
    await supabase
      .from("enrollments")
      .update({ 
        status: "completed",
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("course_id", courseId)

    return NextResponse.json({ success: true, certificate })
  } catch (error) {
    console.error("[v0] Error in certificate issuance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
