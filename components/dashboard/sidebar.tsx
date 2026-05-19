"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  PlayCircle, 
  Award, 
  HelpCircle,
  Settings,
  Shield,
  DollarSign
} from "lucide-react"

const studentLinks = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/aulas", label: "Minhas Aulas", icon: PlayCircle },
  { href: "/dashboard/certificado", label: "Certificado", icon: Award },
  { href: "/dashboard/reembolso", label: "Reembolso", icon: DollarSign },
  { href: "/dashboard/suporte", label: "Suporte", icon: HelpCircle },
  { href: "/dashboard/perfil", label: "Meu Perfil", icon: Settings },
]

interface DashboardSidebarProps {
  isAdmin: boolean
}

export function DashboardSidebar({ isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border p-4 hidden lg:block overflow-y-auto">
      <nav className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-4">
          Menu Principal
        </p>
        {studentLinks.map((link) => {
          const isActive = pathname === link.href
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
        
        {isAdmin && (
          <>
            <div className="my-4 border-t border-border" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-4">
              Administracao
            </p>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Shield className="w-4 h-4" />
              Painel Admin
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}
