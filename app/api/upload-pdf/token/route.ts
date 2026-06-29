export const runtime = 'edge'

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  console.log("[v0] Token route called")
  
  try {
    const body = (await request.json()) as HandleUploadBody
    console.log("[v0] Request body type:", body.type)

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.log("[v0] Generating token for:", pathname)
        
        // Validate file type based on pathname
        const isPdf = pathname.toLowerCase().endsWith('.pdf')
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(pathname)
        
        if (!isPdf && !isImage) {
          console.log("[v0] Invalid file type for:", pathname)
          throw new Error('Tipo de arquivo não permitido')
        }

        return {
          allowedContentTypes: isPdf 
            ? ['application/pdf'] 
            : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[v0] Upload completed:', blob.url)
      },
    })

    console.log("[v0] Token response:", JSON.stringify(jsonResponse))
    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('[v0] Error handling upload:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
