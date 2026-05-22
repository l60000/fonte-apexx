import { Suspense } from "react"
import PagamentoClient from "./pagamento-client"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PagamentoClient />
    </Suspense>
  )
}