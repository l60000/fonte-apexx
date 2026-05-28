"use client"

import { useEffect, useState } from "react"
import { upload } from "@vercel/blob/client"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, FileText, DollarSign, Loader2, Upload, Music, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"


export default function AdminCursosPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [moduleCount, setModuleCount] = useState("6")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [allowDownload, setAllowDownload] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.log("[v0] Error loading courses:", error)
    } else {
      setCourses(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setLongDescription("")
    setPrice("")
    setOriginalPrice("")
    setModuleCount("6")
    setPdfFile(null)
    setImageFile(null)
    setAllowDownload(true)
    setEditingCourse(null)
  }

  const handleEdit = (course: any) => {
    setEditingCourse(course)
    setTitle(course.title)
    setDescription(course.description || "")
    setLongDescription(course.long_description || "")
    setPrice(course.price?.toString() || "")
    setOriginalPrice(course.original_price?.toString() || "")
    setModuleCount(course.module_count?.toString() || "6")
    setAllowDownload(course.allow_download !== false)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    console.log("[v0] Starting course submission")
    
    if (!title || !price) {
      toast({
        title: "Erro",
        description: "Preencha título e preço",
        variant: "destructive",
      })
      return
    }

    // Validate: either editing with existing PDF or new course with PDF file
    if (!editingCourse && !pdfFile) {
      toast({
        title: "Erro",
        description: "É necessário fazer upload de um PDF para criar um novo curso",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      let pdfUrl = editingCourse?.pdf_url || null
      let imageUrl = editingCourse?.image_url || null

      // Upload PDF via client-side upload (supports large files up to 500MB)
      if (pdfFile) {
        console.log("[v0] Uploading PDF:", pdfFile.name, "Size:", pdfFile.size, "bytes")
        
        // Clean filename for better compatibility
        const cleanFileName = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        
        const blob = await upload(`course-pdfs/${cleanFileName}`, pdfFile, {
          access: 'public',
          handleUploadUrl: '/api/upload-pdf/token',
        })
        
        pdfUrl = blob.url
        console.log("[v0] PDF uploaded:", pdfUrl)
      }

      // Upload image via client-side upload
      if (imageFile) {
        console.log("[v0] Uploading image:", imageFile.name)
        
        const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        
        const blob = await upload(`course-images/${cleanFileName}`, imageFile, {
          access: 'public',
          handleUploadUrl: '/api/upload-pdf/token',
        })
        
        imageUrl = blob.url
        console.log("[v0] Image uploaded:", imageUrl)
      }

      const courseData = {
        title,
        description,
        long_description: longDescription,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        module_count: parseInt(moduleCount),
        pdf_url: pdfUrl,
        image_url: imageUrl,
        allow_download: allowDownload,
      }

      console.log("[v0] Saving course data:", courseData)

      if (editingCourse) {
        const { error, data } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", editingCourse.id)
          .select()

        if (error) {
          console.log("[v0] Database update error:", error)
          throw new Error(`Erro ao atualizar curso: ${error.message}`)
        }

        console.log("[v0] Course updated successfully:", data)

        toast({
          title: "Sucesso",
          description: "Curso atualizado com sucesso",
        })
      } else {
        const { error, data } = await supabase
          .from("courses")
          .insert(courseData)
          .select()

        if (error) {
          console.log("[v0] Database insert error:", error)
          throw new Error(`Erro ao criar curso: ${error.message}`)
        }

        console.log("[v0] Course created successfully:", data)

        toast({
          title: "Sucesso",
          description: "Curso criado com sucesso",
        })
      }

      setDialogOpen(false)
      resetForm()
      await loadCourses()
    } catch (error: any) {
      console.log("[v0] Error saving course:", error)
      toast({
        title: "Erro ao salvar curso",
        description: error.message || "Erro desconhecido. Verifique o console para detalhes.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId)

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir curso",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Curso excluído",
      })
      loadCourses()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Cursos</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie cursos em PDF</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Editar Curso" : "Criar Novo Curso"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Lógica de Pilotagem"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Descrição Completa</Label>
                <Textarea
                  id="longDescription"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moduleCount">Número de Módulos</Label>
                <Input
                  id="moduleCount"
                  type="number"
                  value={moduleCount}
                  onChange={(e) => setModuleCount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf">Upload PDF (máx 500MB) *</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagem do Curso</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="allowDownload">Permitir download do PDF</Label>
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingCourse ? "Atualizar" : "Criar Curso"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                </div>
                {course.pdf_url && (
                  <FileText className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">R$ {course.price?.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(course)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  {course.pdf_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1 bg-transparent"
                    >
                      <Link href={`/dashboard/curso/${course.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver PDF
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(course.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {course.pdf_url && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full bg-transparent"
                    >
                      <Link href={`/admin/cursos/${course.id}/pdf-manager`}>
                        <FileText className="w-4 h-4 mr-1" />
                        Gerenciar PDF
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full bg-transparent"
                    >
                      <Link href={`/admin/cursos/${course.id}/audios`}>
                        <Music className="w-4 h-4 mr-1" />
                        Gerenciar Áudios
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum curso cadastrado</h3>
          <p className="text-muted-foreground">Crie seu primeiro curso em PDF</p>
        </div>
      )}
    </div>
  )
}
