'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFViewerProps {
  pdfUrl: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  zoom?: number
  isLocked?: boolean
}

export default function PDFViewer({
  pdfUrl,
  currentPage,
  totalPages,
  onPageChange,
  zoom = 100,
  isLocked = false
}: PDFViewerProps) {
  const handlePrevPage = () => {
    if (currentPage > 1 && !isLocked) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages && !isLocked) {
      onPageChange(currentPage + 1)
    }
  }

  // Construct URL without toolbar
  const embedUrl = `${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`

  return (
    <div className="relative w-full h-full bg-[#525659] overflow-hidden">
      {/* PDF Embed - Clean without any toolbars */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
      >
        <object
          data={embedUrl}
          type="application/pdf"
          className="w-full h-full"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        >
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
          />
        </object>
      </div>

      {/* Navigation Buttons */}
      {!isLocked && (
        <>
          {/* Previous Button */}
          {currentPage > 1 && (
            <Button
              onClick={handlePrevPage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white shadow-xl transition-all hover:scale-110"
              size="icon"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {/* Next Button */}
          {currentPage < totalPages && (
            <Button
              onClick={handleNextPage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white shadow-xl transition-all hover:scale-110"
              size="icon"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </>
      )}
    </div>
  )
}
