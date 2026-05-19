"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Users, Clock, Trophy, CheckCircle, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function CursosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    // Get courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*, enrollments(count)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    setCourses(coursesData || [])

    // Get user enrollments
    if (user) {
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("status", "active")

      const enrolled: Record<string, boolean> = {}
      enrollmentData?.forEach((e) => {
        enrolled[e.course_id] = true
      })
      setEnrollments(enrolled)
    }

    setLoading(false)
  }

  const handleAction = (courseId: string) => {
    if (enrollments[courseId]) {
      // User is enrolled, go to course viewer
      router.push(`/dashboard/curso/${courseId}`)
    } else if (user) {
      // User logged in but not enrolled, go to enrollment
      router.push(`/matricula?curso=${courseId}`)
    } else {
      // User not logged in, go to login
      router.push("/auth/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Nossos <span className="text-primary">Cursos</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra cursos desenvolvidos por especialistas para transformar sua paixão em expertise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {courses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum curso disponível</h3>
                <p className="text-muted-foreground">Novos cursos em breve!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {courses.map((course, index) => {
                const isEnrolled = enrollments[course.id]
                const studentCount = course.enrollments?.[0]?.count || 0
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-primary shadow-lg shadow-primary/20">
                      <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-b-lg w-fit mx-auto">
                        {isEnrolled ? "MATRICULADO" : "LANÇAMENTO"}
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                              R$ {course.price?.toFixed(2)}
                            </div>
                            {course.original_price && (
                              <p className="text-sm text-muted-foreground line-through">
                                R$ {course.original_price.toFixed(2)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">pagamento único</p>
                          </div>
                        </div>
                        
                        <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                        <CardDescription className="text-base">{course.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center justify-center mb-1">
                              <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {course.module_count || 6}
                            </div>
                            <div className="text-xs text-muted-foreground">Módulos</div>
                          </div>
                          
                          <div className="text-center p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center justify-center mb-1">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {studentCount}+
                            </div>
                            <div className="text-xs text-muted-foreground">Alunos</div>
                          </div>
                          
                          <div className="text-center p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center justify-center mb-1">
                              {isEnrolled ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Lock className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {isEnrolled ? "Ativo" : "Bloqueado"}
                            </div>
                            <div className="text-xs text-muted-foreground">Status</div>
                          </div>
                        </div>

                        {/* Description */}
                        {course.long_description && (
                          <div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {course.long_description}
                            </p>
                          </div>
                        )}

                        {/* CTA */}
                        <Button 
                          onClick={() => handleAction(course.id)}
                          className="w-full shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12 text-base font-medium shadow-lg shadow-primary/20"
                        >
                          {isEnrolled ? (
                            <>
                              Acessar Curso
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          ) : user ? (
                            <>
                              Fazer Matrícula
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Entrar para se Matricular
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          {isEnrolled 
                            ? `Acesso vitalício • ${course.allow_download ? 'Download disponível' : 'Somente leitura'}`
                            : "Acesso vitalício • Certificado incluso • Garantia de 7 dias"
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-6 rounded-2xl bg-card border border-border text-center"
          >
            <p className="text-muted-foreground mb-4">
              Novos cursos em breve! Fique ligado nas próximas turmas.
            </p>
            <Button asChild variant="outline" className="rounded-full bg-transparent">
              <Link href="/#features">
                Ver Mais Detalhes
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-24" />
    </div>
  )
}
