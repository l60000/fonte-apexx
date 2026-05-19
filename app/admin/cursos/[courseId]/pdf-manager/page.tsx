"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Trash2, Download, Loader2, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function PDFManagerPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [])

  const loadCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.courseId)
      .single()

    if (error) {
      toast({
        title: "Erro",
        description: "Curso não encontrado",
        variant: "destructive",
      })
      router.push("/admin/cursos")
      return
    }

    setCourse(data)
    
    // Load PDF to get total pages
    if (data.pdf_url) {
      try {
        const response = await fetch(data.pdf_url)
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        
        // Simple PDF page count by counting /Page objects
        const text = new TextDecoder().decode(arrayBuffer)
        const pageMatches = text.match(/\/Type[\s]*\/Page[^s]/g)
        const pageCount = pageMatches ? pageMatches.length : 1
        
        setTotalPages(pageCount)
      } catch (error) {
        console.error("Error loading PDF:", error)
        setTotalPages(1)
      }
    }
    
    setLoading(false)
  }

  const togglePageSelection = (pageNum: number) => {
    const newSelection = new Set(selectedPages)
    if (newSelection.has(pageNum)) {
      newSelection.delete(pageNum)
    } else {
      newSelection.add(pageNum)
    }
    setSelectedPages(newSelection)
  }

  const selectAll = () => {
    const allPages = new Set<number>()
    for (let i = 1; i <= totalPages; i++) {
      allPages.add(i)
    }
    setSelectedPages(allPages)
  }

  const deselectAll = () => {
    setSelectedPages(new Set())
  }

  const handleRemovePages = async () => {
    if (selectedPages.size === 0) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos uma página para remover",
      })
      return
    }

    if (selectedPages.size === totalPages) {
      toast({
        title: "Erro",
        description: "Você não pode remover todas as páginas do PDF",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Remover ${selectedPages.size} página(s) selecionada(s)?`)) {
      return
    }

    setProcessing(true)

    try {
      const response = await fetch("/api/admin/pdf-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "remove",
          courseId: params.courseId,
          pdfUrl: course.pdf_url,
          pagesToRemove: Array.from(selectedPages),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao processar PDF")
      }

      const { newPdfUrl } = await response.json()

      // Update course with new PDF
      await supabase
        .from("courses")
        .update({ pdf_url: newPdfUrl })
        .eq("id", params.courseId)

      toast({
        title: "Sucesso",
        description: "Páginas removidas com sucesso",
      })

      // Reload
      setSelectedPages(new Set())
      await loadCourse()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleAddPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast({
        title: "Erro",
        description: "Apenas arquivos PDF são permitidos",
        variant: "destructive",
      })
      return
    }

    setUploadingPdf(true)

    try {
      console.log("[v0] Starting PDF upload, file size:", file.size)

      // Step 1: Upload via server route (Blob token stays server-side)
      const fd = new FormData()
      fd.append("file", file)
      const uploadRes = await fetch("/api/upload-pdf", { method: "POST", body: fd })
      if (!uploadRes.ok) {
        const txt = await uploadRes.text()
        throw new Error(`Erro ao fazer upload: ${txt}`)
      }
      const uploadData = await uploadRes.json()
      const newPdfUrl = uploadData.url
      console.log("[v0] Upload complete, blob URL:", newPdfUrl)

      // Step 2: Merge with existing PDF on server via pdf-operations
      console.log("[v0] Starting PDF merge operation")
      const mergeRes = await fetch("/api/admin/pdf-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "merge",
          courseId: params.courseId,
          existingPdfUrl: course.pdf_url,
          newPdfUrl: newPdfUrl,
        }),
      })

      if (!mergeRes.ok) {
        const errData = await mergeRes.json().catch(() => ({}))
        console.error("[v0] Merge error:", errData)
        throw new Error(errData.error || "Erro ao mesclar PDFs")
      }

      console.log("[v0] Merge complete")

      toast({
        title: "Sucesso",
        description: "PDF adicionado e mesclado com sucesso",
      })

      e.target.value = ""
      await loadCourse()
    } catch (error: any) {
      console.error("[v0] PDF add error:", error)
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleExportSelected = async () => {
    if (selectedPages.size === 0) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos uma página para exportar",
      })
      return
    }

    setProcessing(true)

    try {
      const response = await fetch("/api/admin/pdf-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "export",
          courseId: params.courseId,
          pdfUrl: course.pdf_url,
          pagesToExport: Array.from(selectedPages).sort((a, b) => a - b),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao exportar PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${course.title}-export.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Sucesso",
        description: "PDF exportado com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="bg-transparent">
          <Link href="/admin/cursos">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gerenciar PDF</h1>
          <p className="text-muted-foreground mt-1">{course?.title}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-4 pb-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Adicionar Novo PDF</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="pdf-upload">Selecione um PDF para adicionar ao curso</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleAddPdf}
                  disabled={uploadingPdf}
                  className="mt-2"
                />
              </div>
              {uploadingPdf && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mesclando PDFs...
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              O novo PDF será adicionado ao final do PDF existente
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de páginas: <span className="font-semibold text-foreground">{totalPages}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Selecionadas: <span className="font-semibold text-foreground">{selectedPages.size}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="bg-transparent">
                Selecionar Todas
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="bg-transparent">
                Limpar Seleção
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRemovePages}
              disabled={processing || selectedPages.size === 0}
              variant="destructive"
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Selecionadas
                </>
              )}
            </Button>
            <Button
              onClick={handleExportSelected}
              disabled={processing || selectedPages.size === 0}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Selecionadas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Card
            key={pageNum}
            className={`cursor-pointer transition-all ${
              selectedPages.has(pageNum)
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-accent"
            }`}
            onClick={() => togglePageSelection(pageNum)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium">Página {pageNum}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
