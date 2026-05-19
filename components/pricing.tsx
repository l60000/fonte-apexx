"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientIfConfigured } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

const features = [
  "Acesso vitalicio a todo o conteudo",
  "6 modulos completos",
  "Certificado digital verificavel",
  "Atualizacoes gratuitas para sempre",
  "Suporte direto com o instrutor",
  "Material complementar em PDF",
  "Acesso mobile (iOS e Android)",
]



function BorderBeam() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div
        className="absolute w-24 h-24 bg-primary/30 blur-xl border-beam"
        style={{
          offsetPath: "rect(0 100% 100% 0 round 16px)",
        }}
      />
    </div>
  )
}

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClientIfConfigured()
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    setIsLoggedIn(!!user)

    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single()

    setCourse(courseData)
    setLoading(false)
  }

  const handleGarantirVaga = () => {
    if (isLoggedIn) {
      router.push("/pagamento")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            Lançamento!!
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Um investimento unico para acesso vitalicio a todo o conteudo.
            Sem mensalidades, sem taxas escondidas.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-2xl bg-card border border-primary/30 hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
          >
            <BorderBeam />

            {/* Course Image - Left Side */}
            <div className="w-full md:w-80 h-48 md:h-auto shrink-0">
              <Image
                src="/images/rafael-curso.png"
                alt="Lógica de Pilotagem - Rafael Figueredo"
                width={400}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left side - Price */}
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {course?.title || "Lógica de Pilotagem"}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {course?.description || "Acesso completo e vitalicio a todo o conteudo do curso"}
                  </p>

                <div className="mb-6">
                  {course?.original_price && (
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {course.original_price.toFixed(2)}
                      </span>
                      <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                        -{Math.round((1 - course.price / course.original_price) * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1 justify-center md:justify-start">
                    <span className="text-5xl font-bold text-foreground">
                      R$ {course?.price?.toFixed(2) || "47,99"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">pagamento unico</p>
                </div>

                <Button
                  onClick={handleGarantirVaga}
                  size="lg"
                  className="w-full md:w-auto shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base font-medium"
                >
                  Garantir Minha Vaga
                </Button>
              </div>

              {/* Right side - Features */}
              <div>
                <p className="text-sm font-medium text-foreground mb-4">O que esta incluso:</p>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
