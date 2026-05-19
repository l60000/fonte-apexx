"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { createClientIfConfigured } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navItems = [
  { label: "Cursos", href: "/cursos" },
  { label: "Sobre os Cursos", href: "#features" },
  { label: "Depoimentos", href: "#testimonials" },
  { label: "Investimento", href: "#pricing" },
  { label: "Comunidade", href: "/comunidade" },
]

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClientIfConfigured()
    if (!supabase) return

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl"
    >
      <nav
        ref={navRef}
        className="relative flex items-center justify-between px-4 py-3 rounded-full bg-card/80 backdrop-blur-md border border-border"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/apexxlogo.png"
            alt="APEXX Logo"
            width={120}
            height={40}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1 relative">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-secondary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button asChild size="sm" className="shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
              <Link href="/dashboard">
                <User className="w-4 h-4 mr-2" />
                Meu Curso
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-secondary">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
                <Link href="/auth/sign-up">Comecar Agora</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            {user ? (
              <Button asChild className="shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                <Link href="/dashboard">Meu Curso</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                  <Link href="/auth/login">Entrar</Link>
                </Button>
                <Button asChild className="shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                  <Link href="/auth/sign-up">Comecar Agora</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
