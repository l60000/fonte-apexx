"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  PlayCircle, Clock, Trophy, BookOpen, Users, Award, 
  DollarSign, TrendingUp, Settings, BarChart3, 
  FileText, Home, ArrowLeft, Flag
} from "lucide-react"

// Demo data
const demoStudentData = {
  name: "Joao Silva",
  progressPercentage: 35,
  hoursStudied: "12h",
  lessonsCompleted: 8,
  certificateAvailable: false,
}

const demoAdminStats = {
  totalStudents: 127,
  activeEnrollments: 98,
  certificatesIssued: 45,
  pendingRefunds: 2,
}

const demoRecentEnrollments = [
  { name: "Maria Santos", course: "Logica de pilotagem", date: "28/01/2026" },
  { name: "Pedro Costa", course: "Logica de pilotagem", date: "27/01/2026" },
  { name: "Ana Oliveira", course: "Logica de pilotagem", date: "26/01/2026" },
  { name: "Carlos Ferreira", course: "Logica de pilotagem", date: "25/01/2026" },
]

const demoNextLessons = [
  { title: "Introducao a Aerodinamica", module: "Modulo 2", duration: "45 min" },
  { title: "Principios de Downforce", module: "Modulo 2", duration: "38 min" },
  { title: "Asa Dianteira e Traseira", module: "Modulo 2", duration: "52 min" },
]

function DemoSidebar({ isAdmin }: { isAdmin: boolean }) {
  const studentLinks = [
    { label: "Inicio", href: "#", icon: Home },
    { label: "Minhas Aulas", href: "#", icon: PlayCircle },
    { label: "Certificado", href: "#", icon: Award },
    { label: "Suporte", href: "#", icon: FileText },
  ]

  const adminLinks = [
    { label: "Dashboard", href: "#", icon: Home },
    { label: "Alunos", href: "#", icon: Users },
    { label: "Cursos", href: "#", icon: BookOpen },
    { label: "Certificados", href: "#", icon: Award },
    { label: "Reembolsos", href: "#", icon: DollarSign },
    { label: "Estatisticas", href: "#", icon: BarChart3 },
    { label: "Configuracoes", href: "#", icon: Settings },
  ]

  const links = isAdmin ? adminLinks : studentLinks

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card pt-16 hidden lg:block">
      <div className="flex h-full flex-col px-4 py-6">
        <nav className="space-y-1">
          {links.map((link, index) => (
            <button
              key={link.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                index === 0 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function StudentDashboardDemo() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bem-vindo, {demoStudentData.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Continue de onde voce parou e avance no seu aprendizado.
        </p>
      </div>

      {/* Progress Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Logica de pilotagem
          </CardTitle>
          <CardDescription>Seu progresso no curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="font-medium text-foreground">{demoStudentData.progressPercentage}%</span>
            </div>
            <Progress value={demoStudentData.progressPercentage} className="h-2" />
            <div className="flex gap-4 pt-4">
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                <PlayCircle className="w-4 h-4 mr-2" />
                Continuar Assistindo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{demoStudentData.hoursStudied}</p>
                <p className="text-sm text-muted-foreground">Tempo de estudo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <PlayCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{demoStudentData.lessonsCompleted}</p>
                <p className="text-sm text-muted-foreground">Aulas concluidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {demoStudentData.certificateAvailable ? "Sim" : "Nao"}
                </p>
                <p className="text-sm text-muted-foreground">Certificado disponivel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Lessons */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Proximas aulas</CardTitle>
          <CardDescription>
            Continue seu aprendizado com as proximas aulas recomendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoNextLessons.map((lesson, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">{lesson.module}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {lesson.duration}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminDashboardDemo() {
  const stats = [
    { 
      label: "Total de Alunos", 
      value: demoAdminStats.totalStudents, 
      icon: Users,
      change: "+12% este mes"
    },
    { 
      label: "Matriculas Ativas", 
      value: demoAdminStats.activeEnrollments, 
      icon: BookOpen,
      change: "+8% este mes"
    },
    { 
      label: "Certificados Emitidos", 
      value: demoAdminStats.certificatesIssued, 
      icon: Award,
      change: "+5% este mes"
    },
    { 
      label: "Reembolsos Pendentes", 
      value: demoAdminStats.pendingRefunds, 
      icon: DollarSign,
      change: "Requer atencao"
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Visao geral do desempenho da plataforma
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Matriculas Recentes</CardTitle>
            <CardDescription>Ultimos alunos matriculados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoRecentEnrollments.map((enrollment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {enrollment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.course}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {enrollment.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
            <CardDescription>Tarefas comuns de administracao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Adicionar Aluno", icon: Users },
                { label: "Novo Curso", icon: BookOpen },
                { label: "Emitir Certificado", icon: Award },
                { label: "Ver Reembolsos", icon: DollarSign },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-center"
                >
                  <action.icon className="w-6 h-6 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("student")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Flag className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">RFAPEXX</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-medium text-primary">Modo Demonstracao</span>
          </div>
        </div>
      </header>

      {/* Tabs for switching views */}
      <div className="pt-16">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="h-14 w-full justify-start bg-transparent border-none rounded-none gap-0">
                <TabsTrigger 
                  value="student" 
                  className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Dashboard do Aluno
                </TabsTrigger>
                <TabsTrigger 
                  value="admin"
                  className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Painel Administrativo
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <DemoSidebar isAdmin={activeTab === "admin"} />

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8 lg:ml-64">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="student" className="mt-0">
                <StudentDashboardDemo />
              </TabsContent>
              <TabsContent value="admin" className="mt-0">
                <AdminDashboardDemo />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}
