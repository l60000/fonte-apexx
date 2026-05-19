"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, MessageCircle, Trophy, Sparkles, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

export default function ComunidadePage() {
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
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-primary">APEXX</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Junte-se a comunidade</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Comunidade <span className="text-primary">APEXX</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Conecte-se com outros pilotos, compartilhe experiencias, tire duvidas e evolua junto com a comunidade APEXX no Discord.
            </p>

            <Button 
              asChild 
              size="lg" 
              className="shimmer-btn bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-primary/20"
            >
              <a href="https://discord.gg/nKyQHCyd7v" target="_blank" rel="noopener noreferrer">
                <Users className="mr-2 h-5 w-5" />
                Entrar no Discord
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Link direto: discord.gg/nKyQHCyd7v
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Por que participar?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comunidade APEXX oferece muito mais do que um grupo de chat
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 rounded-2xl bg-card/50 border border-border/50"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Discussoes tecnicas</h3>
              <p className="text-muted-foreground">
                Participe de conversas aprofundadas sobre pilotagem, setup, telemetria e estrategia com outros alunos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-2xl bg-card/50 border border-border/50"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Networking</h3>
              <p className="text-muted-foreground">
                Conecte-se com pilotos de diversos niveis, troque contatos e forme grupos de treino.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-6 rounded-2xl bg-card/50 border border-border/50"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Eventos exclusivos</h3>
              <p className="text-muted-foreground">
                Participe de desafios, competicoes internas e eventos ao vivo com o instrutor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Pronto para fazer parte?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Junte-se a mais de 200 pilotos que ja fazem parte da comunidade APEXX
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              >
                <a href="https://discord.gg/nKyQHCyd7v" target="_blank" rel="noopener noreferrer">
                  <Users className="mr-2 h-5 w-5" />
                  Entrar no Discord
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-border hover:bg-secondary"
              >
                <Link href="/">Voltar ao inicio</Link>
              </Button>
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
