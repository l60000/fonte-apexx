import { Suspense } from "react"
import PagamentoClient from "./pagamento-client"
import { Loader2 } from "lucide-react"

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    courseId?: string
  }>
}) {
  const params = await searchParams
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PagamentoClient courseId={params.courseId || null} />
    </Suspense>
  )
}
