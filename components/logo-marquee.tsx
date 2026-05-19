"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Star } from "lucide-react"

const testimonials = [
  { name: "Ricardo M.", text: "O curso superou minhas expectativas. A metodologia é clara e os conceitos são bem explicados. Realmente vale a pena!" },
  { name: "Ana Paula S.", text: "Conteúdo muito bem estruturado. Aprendi técnicas que realmente fazem diferença na prática. Recomendo!" },
  { name: "Carlos H.", text: "Excelente investimento! O material é completo e o suporte do instrutor é rápido. Estou muito satisfeito com os resultados." },
  { name: "Mariana L.", text: "Curso muito didático e objetivo. Mesmo sendo iniciante, consegui acompanhar todo o conteúdo sem dificuldades." },
  { name: "Pedro A.", text: "A teoria apresentada no curso fez total diferença no meu desempenho. Material de qualidade e muito bem explicado." },
  { name: "Juliana F.", text: "Adorei a abordagem prática do curso. Os conceitos são apresentados de forma simples e aplicável. Valeu muito a pena!" },
]

export function LogoMarquee() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} id="testimonials" className="py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
          O que nossos alunos dizem
        </p>
      </motion.div>

      <div className="relative">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Marquee container */}
        <div className="flex animate-marquee">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 mx-4 p-6 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {`"${testimonial.text}"`}
              </p>
              <div>
                <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
