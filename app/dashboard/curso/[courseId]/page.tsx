"use client"

import React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Loader2,
  Volume2,
  Lock,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  BookOpen,
  CheckCircle,
  List,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import PDFViewerLarge from "@/components/pdf-viewer-large"

export default function CourseViewerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const supabase = createClient()
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  const [course, setCourse] = useState<any>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageAudio, setPageAudio] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [pageLocked, setPageLocked] = useState(false)
  const [pageProgress, setPageProgress] = useState<Record<number, boolean>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [showPageList, setShowPageList] = useState(false)
  const [pageInput, setPageInput] = useState("")
  const [confirmingRead, setConfirmingRead] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [courseId])

  useEffect(() => {
    if (course) {
      loadPageAudio()
      loadPageProgress()
    }
  }, [currentPage, course])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100)
        setAudioCurrentTime(audio.currentTime)
        setAudioDuration(audio.duration)
      }
    }

    const handleEnded = async () => {
      setIsPlaying(false)
      setPageLocked(false)
      setAudioProgress(0)
      await markPageComplete()
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentPage])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pageLocked) return
      if (e.key === "ArrowRight") handleNextPage()
      if (e.key === "ArrowLeft") handlePrevPage()
      if (e.key === "f" || e.key === "F") toggleFullscreen()
      if (e.key === "+" || e.key === "=") handleZoomIn()
      if (e.key === "-") handleZoomOut()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage, pageLocked, zoom])

  // Fullscreen change detection
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const checkAccess = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.is_admin || false

    if (!isAdmin) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single()

      if (!enrollment) {
        toast({
          title: "Acesso negado",
          description: "Voce precisa estar matriculado neste curso",
          variant: "destructive",
        })
        router.push("/cursos")
        return
      }
    }

    setEnrolled(true)

    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single()

    if (!courseData) {
      toast({
        title: "Erro",
        description: "Curso nao encontrado",
        variant: "destructive",
      })
      router.push("/cursos")
      return
    }

    setCourse(courseData)
    setTotalPages(courseData.total_pages || 0)
    setLoading(false)
  }

  const loadPageAudio = async () => {
    const { data } = await supabase
      .from("course_page_audios")
      .select("*")
      .eq("course_id", courseId)
      .eq("page_number", currentPage)
      .single()

    console.log("[v0] Page audio loaded:", { 
      currentPage, 
      hasAudio: !!data, 
      audioTitle: data?.title,
      audioUrl: data?.audio_url 
    })
    setPageAudio(data)
  }

  const loadPageProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("user_page_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)

    const progress: Record<number, boolean> = {}
    data?.forEach((p) => {
      progress[p.page_number] = p.audio_completed
    })
    setPageProgress(progress)
  }

  const markPageComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("user_page_progress")
      .upsert({
        user_id: user.id,
        course_id: courseId,
        page_number: currentPage,
        audio_completed: true,
        completed_at: new Date().toISOString(),
      })

    loadPageProgress()
  }

  const handleConfirmReading = async () => {
    if (pageProgress[currentPage]) return // Already confirmed
    setConfirmingRead(true)
    await markPageComplete()
    setConfirmingRead(false)
    toast({
      title: "Leitura confirmada",
      description: `Pagina ${currentPage} marcada como concluida`,
    })
  }

  const handlePlayAudio = () => {
    if (!pageAudio || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setPageLocked(false)
    } else {
      audioRef.current.src = pageAudio.audio_url
      audioRef.current.play()
      setIsPlaying(true)
      setPageLocked(true)
    }
  }

  const handleNextPage = () => {
    if (pageLocked) {
      toast({
        title: "Pagina bloqueada",
        description: "Complete o audio antes de avancar",
        variant: "destructive",
      })
      return
    }
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePrevPage = () => {
    if (pageLocked) {
      toast({
        title: "Pagina bloqueada",
        description: "Complete o audio antes de voltar",
        variant: "destructive",
      })
      return
    }
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const goToPage = (page: number) => {
    if (pageLocked) return
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setShowPageList(false)
    }
  }

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(pageInput)
    if (!isNaN(page)) goToPage(page)
    setPageInput("")
  }

  const toggleFullscreen = () => {
    if (!viewerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      viewerRef.current.requestFullscreen()
    }
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 200))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 50))
  const handleZoomReset = () => setZoom(100)

  const handleDownload = () => {
    if (!course?.pdf_url || !course?.allow_download) {
      toast({
        title: "Download nao permitido",
        description: "Este curso nao permite download",
        variant: "destructive",
      })
      return
    }
    window.open(course.pdf_url, "_blank")
  }

  const completedPages = Object.values(pageProgress).filter(Boolean).length
  const progressPercent = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando curso...</p>
        </div>
      </div>
    )
  }

  if (!enrolled) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="max-w-md w-full border-border/50">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">
              Voce precisa estar matriculado para acessar este curso
            </p>
            <Button onClick={() => router.push("/cursos")} className="bg-primary hover:bg-primary/90">
              Ver Cursos Disponiveis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={viewerRef} className={`min-h-screen ${isFullscreen ? "bg-[#1a1a1a]" : "bg-background"}`}>
      <audio ref={audioRef} className="hidden" />

      {/* Top Bar */}
      <div className={`border-b border-border/50 sticky top-0 z-20 ${isFullscreen ? "bg-[#111]" : "bg-card"}`}>
        <div className="flex items-center justify-between px-3 sm:px-4 py-6 gap-3 sm:gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {!isFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 bg-transparent"
                onClick={() => router.push("/dashboard/aulas")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold truncate text-foreground">{course?.title}</h1>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="w-3 h-3 shrink-0" />
                <span>{currentPage} de {totalPages}</span>
                <span className="text-border">|</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="flex sm:hidden items-center gap-1 text-xs text-muted-foreground">
                <span>{currentPage}/{totalPages}</span>
              </div>
            </div>
          </div>

          {/* Right: Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-transparent"
              onClick={() => setShowPageList(!showPageList)}
              title="Lista de paginas"
            >
              <List className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 border-l border-border/50 pl-2 ml-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-transparent" onClick={handleZoomOut} title="Diminuir">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="hidden lg:block text-xs text-muted-foreground px-2 min-w-[44px] text-center font-medium">
                {zoom}%
              </span>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-transparent" onClick={handleZoomIn} title="Aumentar">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 border-l border-border/50 pl-2 ml-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-transparent" onClick={toggleFullscreen} title="Tela cheia">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              {course?.allow_download && (
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-transparent" onClick={handleDownload} title="Download">
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex" style={{ height: isFullscreen ? "calc(100vh - 80px)" : "calc(100vh - 80px)" }}>
        {/* Page List Sidebar */}
        {showPageList && (
          <div className={`w-56 border-r border-border/50 overflow-y-auto ${isFullscreen ? "bg-[#111]" : "bg-card"}`}>
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Paginas</p>
              <div className="space-y-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    disabled={pageLocked}
                    className={`w-full text-left text-xs px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
                      page === currentPage
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    } ${pageLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span>Pagina {page}</span>
                    {pageProgress[page] && (
                      <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col lg:flex-row">
          {/* PDF Section */}
          {course?.pdf_url ? (
            <div className="flex-1 relative flex flex-col">
              <div className="flex-1 relative flex items-center justify-center bg-background">
              {/* PDF.js Viewer - Supports large files (100MB+) */}
              <PDFViewerLarge
                pdfUrl={course.pdf_url}
                currentPage={currentPage}
                zoom={zoom}
                onLoadSuccess={(numPages) => {
                  if (totalPages === 0) {
                    setTotalPages(numPages)
                  }
                }}
                className="w-full h-full"
              />

              {/* Navigation Buttons Below PDF */}
              {!pageLocked && (
                <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-6">
                  {/* Previous Page Button - Left */}
                  {currentPage > 1 ? (
                    <button
                      onClick={handlePrevPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/70 hover:bg-black/85 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="text-sm font-medium">Página anterior</span>
                    </button>
                  ) : (
                    <div /> 
                  )}

                  {/* Next Page Button - Right */}
                  {currentPage < totalPages ? (
                    <button
                      onClick={handleNextPage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/70 hover:bg-black/85 text-white shadow-lg transition-all hover:scale-105 backdrop-blur-sm"
                    >
                      <span className="text-sm font-medium">Próxima página</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              )}


              </div>

              {/* Confirm Reading Button */}
              <div className={`px-4 py-3 border-t border-border/30 ${isFullscreen ? "bg-[#111]" : "bg-card"}`}>
                <div className="flex items-center justify-center">
                  {pageProgress[currentPage] ? (
                    <Button
                      size="sm"
                      disabled
                      className="bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/10"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-2" />
                      Leitura confirmada
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleConfirmReading}
                      disabled={confirmingRead || pageLocked}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {confirmingRead ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 mr-2" />
                          Confirmar leitura da pagina
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">PDF nao disponivel</p>
              </div>
            </div>
          )}

          {/* Audio Player Sidebar */}
          {pageAudio && (
            <div className={`w-80 hidden lg:block border-l border-border/50 ${isFullscreen ? "bg-[#111]" : "bg-card"} overflow-y-auto`}>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Áudio da página</h3>
                  <p className="text-xs text-muted-foreground">{pageAudio.title}</p>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    variant={isPlaying ? "secondary" : "default"}
                    onClick={handlePlayAudio}
                    className={`w-full ${isPlaying ? "" : "bg-primary hover:bg-primary/90"}`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pausar Áudio
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Reproduzir Áudio
                      </>
                    )}
                  </Button>

                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{isPlaying ? formatTime(audioCurrentTime) : "0:00"}</span>
                      <span>{isPlaying ? formatTime(audioDuration) : formatTime(pageAudio.duration_seconds || 0)}</span>
                    </div>
                  </div>

                  {pageProgress[currentPage] && (
                    <div className="flex items-center gap-2 text-xs text-green-500 pt-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Áudio concluído</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Mobile Audio Bar (only on mobile when audio exists) */}
      {pageAudio && !isFullscreen && (
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-border/50 ${isFullscreen ? "bg-[#111]" : "bg-card"}`}>
          <div className="px-4 py-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={isPlaying ? "secondary" : "default"}
                onClick={handlePlayAudio}
                className={`shrink-0 h-9 ${isPlaying ? "" : "bg-primary hover:bg-primary/90"}`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-foreground truncate">{pageAudio.title}</p>
                  {pageProgress[currentPage] && (
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {isPlaying ? `${formatTime(audioCurrentTime)} / ${formatTime(audioDuration)}` : formatTime(pageAudio.duration_seconds || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legacy bottom bars - remove these */}
      <div className="hidden">
        {pageAudio && (
          <div className="px-4 py-2 border-b border-border/30">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <Button
                size="sm"
                variant={isPlaying ? "secondary" : "default"}
                onClick={handlePlayAudio}
                className={`shrink-0 h-8 ${isPlaying ? "" : "bg-primary hover:bg-primary/90"}`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-foreground truncate">{pageAudio.title}</p>
                  {pageProgress[currentPage] && (
                    <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {isPlaying ? `${formatTime(audioCurrentTime)} / ${formatTime(audioDuration)}` : formatTime(pageAudio.duration_seconds || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
