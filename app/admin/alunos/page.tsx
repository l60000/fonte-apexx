import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Mail, Calendar, Award } from "lucide-react"
import EnrollmentDialog from "./enrollment-dialog"
import UnenrollButton from "./unenroll-button"
import GrantAccessButton from "./grant-access-button"

export default async function AdminAlunosPage() {
  const supabase = await createClient()

  // Get all students (non-admin profiles)
  const { data: students } = await supabase
    .from("profiles")
    .select(`
      *,
      enrollments (
        id,
        status,
        progress_percentage,
        admin_granted_access,
        courses (title, id)
      )
    `)
    .eq("is_admin", false)
    .order("created_at", { ascending: false })
  
  // Get payment info separately for each student using user_id + course_id
  const studentsWithPayments = await Promise.all(
    (students || []).map(async (student) => {
      if (student.enrollments && student.enrollments.length > 0) {
        const enrollment = student.enrollments[0]
        const { data: payment } = await supabase
          .from("payments")
          .select("status, created_at")
          .eq("user_id", student.id)
          .eq("course_id", enrollment.courses?.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        
        return {
          ...student,
          enrollments: [{
            ...enrollment,
            payment: payment
          }]
        }
      }
      return student
    })
  )

  // Get all courses for the enrollment dialog
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("is_active", true)
    .order("title", { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie os alunos matriculados na plataforma
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Users className="w-4 h-4 mr-2" />
          Adicionar Aluno
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou email..." 
          className="pl-10"
        />
      </div>

      {/* Students Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {studentsWithPayments?.length || 0} aluno(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentsWithPayments && studentsWithPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aluno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Curso</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progresso</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data Cadastro</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsWithPayments.map((student) => {
                    const enrollment = student.enrollments?.[0]
                    return (
                      <tr key={student.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{student.full_name || "Sem nome"}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-foreground">
                              {enrollment?.courses?.title || "Nao matriculado"}
                            </span>
                            {enrollment && (
                              <div className="flex items-center gap-1">
                                {enrollment.status === "active" ? (
                                  enrollment.payment?.status === "completed" ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/30">
                                      Pago
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                                      Pagamento Pendente
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/30">
                                    Inativo
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {enrollment ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-secondary rounded-full">
                                <div 
                                  className="h-2 bg-primary rounded-full"
                                  style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {enrollment.progress_percentage || 0}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(student.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <EnrollmentDialog 
                              studentId={student.id}
                              studentName={student.full_name || student.email}
                              courses={courses || []}
                              currentEnrollments={student.enrollments || []}
                            />
                            {enrollment && (
                              <>
                                <GrantAccessButton
                                  enrollmentId={enrollment.id}
                                  studentName={student.full_name || student.email}
                                  courseName={enrollment.courses?.title || "Curso"}
                                  currentAccess={enrollment.admin_granted_access || false}
                                />
                                <UnenrollButton
                                  enrollmentId={enrollment.id}
                                  studentName={student.full_name || student.email}
                                  courseName={enrollment.courses?.title || "Curso"}
                                />
                              </>
                            )}
                            {enrollment && enrollment.progress_percentage >= 100 && (
                              <Button variant="ghost" size="sm" className="text-primary bg-transparent">
                                <Award className="w-4 h-4 mr-1" />
                                Certificado
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhum aluno cadastrado ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
