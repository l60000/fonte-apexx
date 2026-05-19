"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const PDFJS_VERSION = "3.11.174"
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`

interface PDFViewerLargeProps {
  pdfUrl: string
  currentPage: number
  zoom: number
  onLoadSuccess?: (numPages: number) => void
  className?: string
}

let pdfJsLoadPromise: Promise<any> | null = null

function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject("SSR")

  const win = window as any
  if (win.pdfjsLib) return Promise.resolve(win.pdfjsLib)

  if (pdfJsLoadPromise) return pdfJsLoadPromise

  pdfJsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `${PDFJS_CDN}/pdf.min.js`
    script.crossOrigin = "anonymous"
    script.onload = () => {
      const lib = (window as any).pdfjsLib
      if (!lib) { reject(new Error("pdfjsLib not found")); return }
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`
      resolve(lib)
    }
    script.onerror = () => reject(new Error("Failed to load PDF.js"))
    document.head.appendChild(script)
  })

  return pdfJsLoadPromise
}

export default function PDFViewerLarge({
  pdfUrl,
  currentPage,
  zoom,
  onLoadSuccess,
  className = "",
}: PDFViewerLargeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<any>(null)
  const renderTaskRef = useRef<any>(null)
  const [status, setStatus] = useState<"loading" | "rendering" | "ready" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const [loadedUrl, setLoadedUrl] = useState("")

  const renderPage = useCallback(async (pdf: any, pageNum: number, zoomLevel: number) => {
    if (!canvasRef.current) return

    // Cancel any in-flight render
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel() } catch {}
      renderTaskRef.current = null
    }

    setStatus("rendering")
    try {
      const page = await pdf.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return

      const container = containerRef.current
      const containerW = container?.clientWidth || 800
      const containerH = container?.clientHeight || 600

      const baseViewport = page.getViewport({ scale: 1 })
      const scaleToFit = Math.min(
        (containerW * 0.96) / baseViewport.width,
        (containerH * 0.96) / baseViewport.height
      )
      const finalScale = scaleToFit * (zoomLevel / 100)
      const viewport = page.getViewport({ scale: finalScale })

      // Use devicePixelRatio for sharp rendering on retina screens
      const dpr = window.devicePixelRatio || 1
      canvas.width = viewport.width * dpr
      canvas.height = viewport.height * dpr
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.scale(dpr, dpr)

      const task = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = task
      await task.promise
      renderTaskRef.current = null
      setStatus("ready")
    } catch (err: any) {
      if (err?.name === "RenderingCancelledException") return
      setStatus("error")
      setErrorMsg("Erro ao renderizar página")
    }
  }, [])

  const loadDocument = useCallback(async (url: string) => {
    setStatus("loading")
    setErrorMsg("")
    try {
      const pdfjsLib = await loadPdfJs()
      const task = pdfjsLib.getDocument({
        url,
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/cmaps/`,
        cMapPacked: true,
      })
      const pdf = await task.promise
      pdfDocRef.current = pdf
      setLoadedUrl(url)
      onLoadSuccess?.(pdf.numPages)
      await renderPage(pdf, currentPage, zoom)
    } catch (err: any) {
      setStatus("error")
      setErrorMsg("Não foi possível carregar o PDF. Verifique sua conexão.")
    }
  }, []) // eslint-disable-line

  // Load when URL changes
  useEffect(() => {
    if (!pdfUrl) return
    if (pdfUrl === loadedUrl && pdfDocRef.current) {
      // URL hasn't changed, just re-render current page
      renderPage(pdfDocRef.current, currentPage, zoom)
    } else {
      loadDocument(pdfUrl)
    }
  }, [pdfUrl]) // eslint-disable-line

  // Re-render on page or zoom change
  useEffect(() => {
    if (!pdfDocRef.current) return
    renderPage(pdfDocRef.current, currentPage, zoom)
  }, [currentPage, zoom, renderPage])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center bg-[#404040] overflow-auto ${className}`}
    >
      {/* Subtle grid texture for the "reader" feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Loading overlay */}
      {(status === "loading" || status === "rendering") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-4 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-white/80" />
            <p className="text-sm text-white/70">
              {status === "loading" ? "Carregando documento..." : "Renderizando página..."}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-8 py-6 flex flex-col items-center gap-3 max-w-sm text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-white/80">{errorMsg}</p>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => loadDocument(pdfUrl)}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {/* Canvas - the actual PDF page */}
      <canvas
        ref={canvasRef}
        className="relative z-0 shadow-2xl"
        style={{
          opacity: status === "ready" ? 1 : 0,
          transition: "opacity 0.2s ease",
          borderRadius: "2px",
          maxWidth: "100%",
        }}
      />
    </div>
  )
}
