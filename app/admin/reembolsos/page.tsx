import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import RefundActions from "./refund-actions"

export default async function AdminReembolsosPage() {
  const supabase = await createClient()

  // Get only pending refund requests - using explicit foreign key to avoid ambiguity
  const { data: refunds, error: refundsError } = await supabase
    .from("refund_requests")
    .select(`
      *,
      profiles!refund_requests_user_id_fkey (full_name, email),
      enrollments (
        courses (title)
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  console.log("[v0] Admin refunds - data:", refunds)
  console.log("[v0] Admin refunds - error:", refundsError)

  const pendingCount = refunds?.filter(r => r.status === "pending").length || 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-500">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        )
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500">
            <XCircle className="w-3 h-3" />
            Rejeitado
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reembolsos</h1>
        <p className="text-muted-foreground">
          Gerencie as solicitacoes de reembolso
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {refunds?.filter(r => r.status === "approved").length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {refunds?.filter(r => r.status === "rejected").length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Requests Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Solicitacoes de Reembolso
          </CardTitle>
          <CardDescription>
            {refunds?.length || 0} solicitacao(oes) no total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {refunds && refunds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aluno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Curso</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Motivo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {refund.profiles?.full_name || "Sem nome"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {refund.profiles?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-foreground">
                          {refund.enrollments?.courses?.title || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {refund.reason}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(refund.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="py-4 px-4">
                        {refund.status === "pending" && (
                          <RefundActions
                            refundId={refund.id}
                            studentName={refund.profiles?.full_name || refund.profiles?.email || "Aluno"}
                            courseName={refund.enrollments?.courses?.title || "Curso"}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Nenhuma solicitacao de reembolso encontrada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
