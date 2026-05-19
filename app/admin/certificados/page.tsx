"use client"

import React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download, Calendar, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminCertificadosPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [certificates, setCertificates] = useState<any[]>([])
  const [pendingCertificates, setPendingCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    // Get all certificates
    const { data: certificatesData } = await supabase
      .from("certificates")
      .select(`
        *,
        profiles (full_name, email),
        courses (title)
      `)
      .order("issued_at", { ascending: false })

    // Get students who completed the course but don't have a certificate
    const { data: completedEnrollments } = await supabase
      .from("enrollments")
      .select(`
        *,
        profiles (id, full_name, email),
        courses (id, title)
      `)
      .eq("status", "completed")

    const pending = completedEnrollments?.filter(enrollment => {
      return !certificatesData?.find(cert => 
        cert.user_id === enrollment.user_id && cert.course_id === enrollment.course_id
      )
    })

    setCertificates(certificatesData || [])
    setPendingCertificates(pending || [])
    setLoading(false)
  }

  const handleIssueCertificate = async (userId: string, courseId: string) => {
    setIssuing(`${userId}-${courseId}`)

    try {
      const response = await fetch("/api/admin/certificates/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          courseId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to issue certificate")
      }

      toast({
        title: "Certificado emitido!",
        description: "O certificado foi emitido com sucesso para o aluno.",
      })

      // Reload data
      loadData()
    } catch (error: any) {
      console.log("[v0] Error issuing certificate:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao emitir certificado",
        variant: "destructive",
      })
    } finally {
      setIssuing(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Certificados</h1>
          <p className="text-muted-foreground">
            Gerencie os certificados emitidos
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Award className="w-4 h-4 mr-2" />
          Emitir Certificado
        </Button>
      </div>

      {/* Pending Certificates */}
      {pendingCertificates && pendingCertificates.length > 0 && (
        <Card className="bg-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <Award className="w-5 h-5" />
              Certificados Pendentes
            </CardTitle>
            <CardDescription>
              Alunos que completaram o curso mas ainda não receberam certificado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingCertificates.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {enrollment.profiles?.full_name || enrollment.profiles?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.courses?.title}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={() => handleIssueCertificate(enrollment.profiles.id, enrollment.courses.id)}
                    disabled={issuing === `${enrollment.profiles.id}-${enrollment.courses.id}`}
                  >
                    {issuing === `${enrollment.profiles.id}-${enrollment.courses.id}` ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Emitindo...
                      </>
                    ) : (
                      "Emitir Certificado"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issued Certificates */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Certificados Emitidos
          </CardTitle>
          <CardDescription>
            {certificates?.length || 0} certificado(s) emitido(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aluno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Curso</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Codigo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data Emissao</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {cert.profiles?.full_name || "Sem nome"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {cert.profiles?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-foreground">
                          {cert.courses?.title || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                          {cert.certificate_number}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhum certificado emitido ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
