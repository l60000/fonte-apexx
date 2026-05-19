"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2, Loader2, Music, Upload } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function CourseAudiosPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const supabase = createClient()
  const { toast } = useToast()

  const [course, setCourse] = useState<any>(null)
  const [audios, setAudios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [pageNumber, setPageNumber] = useState("")
  const [audioTitle, setAudioTitle] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    setLoading(true)

    // Load course
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single()

    setCourse(courseData)

    // Load audios
    const { data: audiosData } = await supabase
      .from("course_page_audios")
      .select("*")
      .eq("course_id", courseId)
      .order("page_number", { ascending: true })

    setAudios(audiosData || [])
    setLoading(false)
  }

  const resetForm = () => {
    setPageNumber("")
    setAudioTitle("")
    setAudioFile(null)
  }

  const handleSubmit = async () => {
    if (!pageNumber || !audioFile) {
      toast({
        title: "Erro",
        description: "Preencha o número da página e selecione um áudio",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Upload audio file
      const fileName = `${Date.now()}-${audioFile.name}`
      const { error: uploadError } = await supabase.storage
        .from("courses")
        .upload(`audios/${fileName}`, audioFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("courses")
        .getPublicUrl(`audios/${fileName}`)

      // Get audio duration (optional, can be calculated on client)
      const audio = new Audio()
      audio.src = URL.createObjectURL(audioFile)
      
      await new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", resolve)
      })

      const durationSeconds = Math.floor(audio.duration)

      // Save to database
      const { error } = await supabase
        .from("course_page_audios")
        .insert({
          course_id: courseId,
          page_number: parseInt(pageNumber),
          audio_url: publicUrl,
          duration_seconds: durationSeconds,
          title: audioTitle || `Página ${pageNumber}`,
        })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Áudio adicionado com sucesso",
      })

      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.log("[v0] Error uploading audio:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar áudio",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (audioId: string) => {
    if (!confirm("Tem certeza que deseja excluir este áudio?")) return

    const { error } = await supabase
      .from("course_page_audios")
      .delete()
      .eq("id", audioId)

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir áudio",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Áudio excluído",
      })
      loadData()
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/cursos")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Áudios do Curso</h1>
          <p className="text-muted-foreground mt-1">{course?.title}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Áudio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Áudio à Página</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pageNumber">Número da Página *</Label>
                <Input
                  id="pageNumber"
                  type="number"
                  min="1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  placeholder="Ex: 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioTitle">Título do Áudio</Label>
                <Input
                  id="audioTitle"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="Ex: Introdução"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio">Arquivo de Áudio *</Label>
                <Input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: MP3, WAV, OGG
                </p>
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar Áudio
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audios.map((audio) => (
          <Card key={audio.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">Página {audio.page_number}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {audio.title}
                  </p>
                  {audio.duration_seconds && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.floor(audio.duration_seconds / 60)}:{(audio.duration_seconds % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(audio.audio_url, '_blank')}
                  className="flex-1"
                >
                  Ouvir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(audio.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {audios.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum áudio adicionado</h3>
          <p className="text-muted-foreground">
            Adicione áudios para páginas específicas do PDF
          </p>
        </div>
      )}
    </div>
  )
}
