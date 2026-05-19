export const runtime = 'nodejs'
export const maxDuration = 300

import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    // Check authentication and admin status
    const supabase = await createClient()
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

    // Get the file from the form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.some(t => file.type.startsWith(t.split("/")[0]) || file.type === t)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 })
    }

    const isPdf = file.type.includes("pdf")
    const folder = isPdf ? "course-pdfs" : "course-images"

    // Clean filename for better compatibility
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

    // Upload to Vercel Blob (supports up to 500MB)
    const blob = await put(`${folder}/${cleanFileName}`, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error: any) {
    console.error("Error uploading PDF:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao fazer upload" },
      { status: 500 }
    )
  }
}
