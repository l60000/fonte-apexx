"use client"

import { motion } from "framer-motion"
import { ArrowRight, Trophy, Clock, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createClientIfConfigured } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const stats = [
  { icon: Users, value: "200+", label: "Alunos Formados" },
  { icon: Clock, value: "6", label: "Modulos" },
  { icon: Trophy, value: "10+", label: "Engenharia Dinamica" },
  { icon: Award, value: "150+", label: "Certificados" },
]

const textRevealVariants = {
  hidden: { y: "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.1,
    },
  }),
}

export function Hero() {
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

  const handleMatricular = () => {
    if (isLoggedIn) {
      router.push("/pagamento")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card pointer-events-none" />

      {/* Racing stripe accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent pointer-events-none" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-12"
        >
          <span className="w-2 h-2 rounded-full bg-primary pulse-glow" />
          <span className="text-sm text-muted-foreground">Vagas Limitadas - Turma 2026</span>
        </motion.div>

        {/* Headline with logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-10 flex justify-center"
        >
          <Image
            src="/images/apexx-logo-new.png"
            alt="APEXX Logo"
            width={700}
            height={280}
            className="w-full max-w-2xl h-auto object-contain"
          />
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed -mt-4"
        >
          Antes da tecnica, estrategia e controle em alta velocidade.
        </motion.p>
      </div>
    </section>
  )
}
