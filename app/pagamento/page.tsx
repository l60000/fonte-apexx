import PagamentoClient from "./pagamento-client"

export default function Page({
  searchParams,
}: {
  searchParams: {
    courseId?: string
  }
}) {
  return (
    <PagamentoClient
      courseId={searchParams.courseId || null}
    />
  )
}