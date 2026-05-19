export const runtime = 'nodejs'
export const maxDuration = 300

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PDFDocument } from "pdf-lib"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
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

    const body = await request.json()
    const { operation, pdfUrl, pagesToRemove, pagesToExport, courseId, existingPdfUrl, newPdfUrl } = body

    if (operation === "merge") {
      // Merge two PDFs together
      console.log("[v0] Starting PDF merge operation")
      console.log("[v0] existingPdfUrl:", existingPdfUrl)
      console.log("[v0] newPdfUrl:", newPdfUrl)

      if (!existingPdfUrl || !newPdfUrl) {
        return NextResponse.json({ error: "URLs dos PDFs são obrigatórias" }, { status: 400 })
      }

      // Fetch both PDFs
      const [existingRes, newRes] = await Promise.all([
        fetch(existingPdfUrl),
        fetch(newPdfUrl),
      ])

      if (!existingRes.ok || !newRes.ok) {
        console.error("[v0] Failed to fetch PDFs:", existingRes.status, newRes.status)
        return NextResponse.json({ error: "Erro ao baixar os PDFs" }, { status: 500 })
      }

      const [existingBuffer, newBuffer] = await Promise.all([
        existingRes.arrayBuffer(),
        newRes.arrayBuffer(),
      ])

      console.log("[v0] Loaded existing PDF:", existingBuffer.byteLength, "bytes")
      console.log("[v0] Loaded new PDF:", newBuffer.byteLength, "bytes")

      const existingDoc = await PDFDocument.load(existingBuffer)
      const newDoc = await PDFDocument.load(newBuffer)

      // Copy all pages from the new PDF into the existing one
      const copiedPages = await existingDoc.copyPages(newDoc, newDoc.getPageIndices())
      copiedPages.forEach((page) => existingDoc.addPage(page))

      console.log("[v0] Merged PDF total pages:", existingDoc.getPageCount())

      const mergedBytes = await existingDoc.save()

      // Upload merged PDF to Vercel Blob
      const blob = await put(`course-pdfs/merged-${Date.now()}.pdf`, mergedBytes, {
        access: "public",
        addRandomSuffix: true,
        contentType: "application/pdf",
      })

      console.log("[v0] Uploaded merged PDF to:", blob.url)

      // Update course with merged PDF URL
      if (courseId) {
        const { error: updateError } = await supabase
          .from("courses")
          .update({ pdf_url: blob.url })
          .eq("id", courseId)

        if (updateError) {
          console.error("[v0] Error updating course:", updateError)
        } else {
          console.log("[v0] Course updated with new PDF URL")
        }
      }

      return NextResponse.json({ mergedPdfUrl: blob.url })
    }

    // For remove and export, we need the pdfUrl
    if (!pdfUrl) {
      return NextResponse.json({ error: "URL do PDF é obrigatória" }, { status: 400 })
    }

    // Fetch the PDF
    const pdfResponse = await fetch(pdfUrl)
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    if (operation === "remove") {
      // Create a new PDF without the specified pages
      const newPdf = await PDFDocument.create()
      const totalPages = pdfDoc.getPageCount()
      
      const pagesToKeep = []
      for (let i = 0; i < totalPages; i++) {
        if (!pagesToRemove.includes(i + 1)) {
          pagesToKeep.push(i)
        }
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep)
      copiedPages.forEach((page) => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      
      // Upload to Vercel Blob
      const blob = await put(`course-pdfs/modified-${Date.now()}.pdf`, pdfBytes, {
        access: "public",
        addRandomSuffix: true,
        contentType: "application/pdf",
      })

      return NextResponse.json({ newPdfUrl: blob.url })
    }

    if (operation === "export") {
      // Create a new PDF with only the specified pages
      const newPdf = await PDFDocument.create()
      
      const pageIndices = pagesToExport.map((p: number) => p - 1)
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
      copiedPages.forEach((page) => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      
      return new NextResponse(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=export.pdf",
        },
      })
    }

    return NextResponse.json({ error: "Operação inválida" }, { status: 400 })
  } catch (error: any) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao processar PDF" },
      { status: 500 }
    )
  }
}
