import { Suspense } from "react"
import PagamentoClient from "./pagamento-client"

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PagamentoClient />
    </Suspense>
  )
}