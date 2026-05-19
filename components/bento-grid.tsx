"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Gauge, Settings, BarChart3, Zap, GraduationCap, Trophy } from "lucide-react"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const modules = [
  "Introducao ao Automobilismo",
  "Aerodinamica",
  "Powertrain",
  "Telemetria",
  "Estrategia",
  "Regulamentos",
]

export function BentoGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            O que voce vai aprender
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Um curriculo completo desenvolvido por especialistas do automobilismo com mais de 15 anos de experiencia.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Large card - Conteudo do Curso */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <GraduationCap className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Conteudo Completo</h3>
                <p className="text-muted-foreground text-sm">
                  Desde os fundamentos ate estrategias avancadas de corrida utilizadas por pilotos profissionais.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {modules.map((module) => (
                <div
                  key={module}
                  className="px-3 py-2 text-sm bg-secondary/50 rounded-lg text-muted-foreground text-center"
                >
                  {module}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Aerodinamica */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
              <Settings className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Engenharia e Aerodinamica</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Entenda como os carros de corrida geram downforce e como o design impacta a performance.
            </p>
            <div className="flex items-center gap-2 text-primary text-sm">
              <span className="font-mono">10+</span>
              <span className="text-muted-foreground">aulas praticas</span>
            </div>
          </motion.div>

          {/* Telemetria */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
              <BarChart3 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Analise de Telemetria</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Aprenda a interpretar dados em tempo real como os engenheiros das equipes.
            </p>
            <div className="h-12 flex items-end gap-1">
              {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
              <Gauge className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Setup e Performance</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Descubra como os ajustes de setup afetam o comportamento do carro em cada circuito.
            </p>
            <div className="flex items-center gap-2 text-primary text-sm">
              <Zap className="w-4 h-4" />
              <span className="text-muted-foreground">Simulacoes interativas</span>
            </div>
          </motion.div>

          {/* Certificado */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
              <Trophy className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Certificado Reconhecido</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Ao concluir, receba um certificado digital verificavel para adicionar ao seu curriculo.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs bg-primary/10 rounded text-primary">Digital</span>
              <span className="px-2 py-1 text-xs bg-primary/10 rounded text-primary">Verificavel</span>
              <span className="px-2 py-1 text-xs bg-primary/10 rounded text-primary">Vitalicio</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
