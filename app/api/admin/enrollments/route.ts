import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
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

    const { userId, courseId } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "userId and courseId are required" },
        { status: 400 }
      )
    }

    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (existingEnrollment) {
      // Update existing enrollment to active
      const { error: updateError } = await supabase
        .from("enrollments")
        .update({ status: "active" })
        .eq("id", existingEnrollment.id)

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update enrollment" },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        message: "Enrollment reactivated successfully",
        enrollmentId: existingEnrollment.id
      })
    }

    // Create new enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .insert({
        user_id: userId,
        course_id: courseId,
        status: "active",
        progress_percentage: 0,
      })
      .select()
      .single()

    if (enrollError) {
      return NextResponse.json(
        { error: "Failed to create enrollment" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: "Enrollment created successfully",
      enrollment
    })

  } catch (error) {
    console.error("[v0] Enrollment creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    
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

    const { enrollmentId } = await request.json()

    if (!enrollmentId) {
      return NextResponse.json({ error: "ID da matrícula é obrigatório" }, { status: 400 })
    }

    // Delete enrollment
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("id", enrollmentId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting enrollment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
