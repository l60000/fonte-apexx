"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ArrowRight, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientIfConfigured } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientIfConfigured()
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleComecarAgora = () => {
    router.push("/cursos")
  }

  return (
    <section className="py-24 px-4">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8">
          <Flag className="w-8 h-8 text-primary" />
        </div>
        
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-cal-sans)" }}
        >
          Sua largada para o
          <span className="text-primary"> conhecimento</span>
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Nao perca mais tempo. Junte-se a centenas de alunos que ja estao dominando o automobilismo 
          e transforme sua paixao em expertise.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleComecarAgora}
            size="lg"
            className="shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-primary/20"
          >
            Comecar Agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-14 text-base font-medium border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border bg-transparent"
          >
            <Link href="/sobre">
              Conhecer o Instrutor
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Garantia de 7 dias. Se nao gostar, devolvemos 100% do seu dinheiro.
        </p>
      </motion.div>
    </section>
  )
}
