"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings,
  Award,
  BarChart3,
  RotateCcw,
  ArrowLeft,
  PlayCircle,
  HelpCircle,
  FileCheck
} from "lucide-react"

const adminLinks = [
  { href: "/admin", label: "Visao Geral", icon: LayoutDashboard },
  { href: "/admin/alunos", label: "Alunos", icon: Users },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/proximas-aulas", label: "Proximas Aulas", icon: PlayCircle },
  { href: "/admin/questionarios", label: "Questionarios", icon: HelpCircle },
  { href: "/admin/prova-final", label: "Prova Final", icon: FileCheck },
  { href: "/admin/certificados", label: "Certificados", icon: Award },
  { href: "/admin/estatisticas", label: "Estatisticas", icon: BarChart3 },
  { href: "/admin/reembolsos", label: "Reembolsos", icon: RotateCcw },
  { href: "/admin/configuracoes", label: "Configuracoes", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border p-4 hidden lg:block overflow-y-auto">
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
        
        <div className="my-2 border-t border-border" />
        
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-4">
          Administracao
        </p>
        
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== "/admin" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
