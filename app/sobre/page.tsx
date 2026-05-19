"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Flag, Users, Car, Music, Monitor, Target } from "lucide-react"
import { motion } from "framer-motion"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Flag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-primary">APEXX</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Sobre o Instrutor
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Raphael <span className="text-primary">Figueiredo</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Piloto profissional de automobilismo
            </p>
          </motion.div>

          {/* Main Photo - Podium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative aspect-[3/4] md:aspect-[16/10] rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10">
              <Image
                src="/images/sem-titulo2.jpg"
                alt="Raphael Figueiredo no podio com trofeu - Campeonato Paulista Formula Inter"
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Trophy className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-lg md:text-xl font-semibold text-foreground">Campeonato Paulista</p>
                    <p className="text-muted-foreground text-sm md:text-base">Formula Inter</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Uma trajetoria marcada por <span className="text-primary">determinacao</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Raphael Figueiredo e piloto profissional de automobilismo, com uma trajetoria marcada por determinacao, estudo e paixao pelo esporte a motor. Iniciou sua carreira de forma nao convencional, aos 27 anos, construindo seu proprio simulador e desenvolvendo suas habilidades tecnicas ate alcancar o alto nivel competitivo.
                </p>
                <p>
                  Alem das pistas, Raphael possui formacao e atuacao profissional na musica, area em que construiu solida experiencia, e tambem na tecnologia da informacao, o que contribui diretamente para sua abordagem analitica, estrategica e precisa no automobilismo.
                </p>
              </div>
              
              {/* Skills badges */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
                  <Car className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Automobilismo</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
                  <Music className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Musica</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
                  <Monitor className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Tecnologia</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                <Image
                  src="/images/sem-titulo4.jpg"
                  alt="Raphael Figueiredo no cockpit pronto para corrida"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 md:h-24 md:w-24 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                <Target className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Nas <span className="text-primary">Pistas</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Momentos marcantes da carreira de Raphael Figueiredo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Large image - karting photo with peace sign */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/50 group shadow-lg md:row-span-2"
            >
              <Image
                src="/images/rafa.jpg"
                alt="Raphael Figueiredo no kart numero 29"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium text-foreground">Raphael no kart #29</p>
              </div>
            </motion.div>

            {/* Karting grid photo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[16/10] rounded-xl overflow-hidden border border-border/50 group shadow-lg"
            >
              <Image
                src="/images/rafae.jpg"
                alt="Raphael liderando no grid de largada"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium text-foreground">Grid de largada</p>
              </div>
            </motion.div>

            {/* Side view racing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative aspect-[16/10] rounded-xl overflow-hidden border border-border/50 group shadow-lg"
            >
              <Image
                src="/images/sem-titulo3.jpg"
                alt="Carro de formula vermelho #7 em acao - vista lateral"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium text-foreground">Carro #7 em acao</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nathan Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                <Image
                  src="/images/sem-titulo5.jpg"
                  alt="Raphael Figueiredo com Nathan no carro de formula"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute -top-4 -left-4 h-20 w-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="flex items-center gap-3">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  Legado Familiar
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Formando a proxima <span className="text-primary">geracao</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                E tambem pai de Nathan, jovem talento que desde cedo foi incentivado no esporte e hoje, aos 9 anos, ja demonstra dominio tecnico em diferentes tipos de carros e circuitos, refletindo o compromisso de Raphael com formacao, disciplina e excelencia.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-display font-bold text-primary">9</span>
                  <span className="text-sm text-muted-foreground">anos de idade</span>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="flex flex-col">
                  <span className="text-3xl font-display font-bold text-primary">+</span>
                  <span className="text-sm text-muted-foreground">circuitos dominados</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Metodologia
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-6 text-balance">
              Metodologia <span className="text-primary">APEXX</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Sua metodologia une pratica, teoria e tecnologia para formar pilotos mais conscientes, rapidos e consistentes, tornando sua experiencia nas pistas acessivel a todos que desejam evoluir no automobilismo.
            </p>
            
            {/* Method pillars */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              <div className="p-6 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Pratica</h3>
                <p className="text-sm text-muted-foreground">Exercicios focados em simulador e pista</p>
              </div>
              <div className="p-6 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Teoria</h3>
                <p className="text-sm text-muted-foreground">Fundamentos tecnicos e estrategicos</p>
              </div>
              <div className="p-6 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Tecnologia</h3>
                <p className="text-sm text-muted-foreground">Analise de dados e telemetria</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 w-full sm:w-auto">
                  Quero me matricular
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="bg-transparent border-border hover:bg-secondary w-full sm:w-auto">
                  Voltar ao inicio
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 APEXX. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
