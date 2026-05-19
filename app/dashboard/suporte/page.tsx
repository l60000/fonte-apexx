"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MessageCircle, Mail, HelpCircle, Loader2, CheckCircle } from "lucide-react"

const faqs = [
  {
    question: "Como funciona o acesso ao curso?",
    answer: "Apos a confirmacao do pagamento, voce recebe acesso imediato a plataforma. Basta fazer login com seu email cadastrado e todo o conteudo estara disponivel na area 'Minhas Aulas'."
  },
  {
    question: "Por quanto tempo terei acesso?",
    answer: "O acesso ao curso e vitalicio. Uma vez matriculado, voce podera assistir as aulas quantas vezes quiser, para sempre, incluindo todas as atualizacoes futuras."
  },
  {
    question: "Como funciona a garantia de 7 dias?",
    answer: "Se por qualquer motivo voce nao ficar satisfeito com o curso, basta solicitar o reembolso dentro de 7 dias apos a compra. Devolveremos 100% do valor pago, sem perguntas."
  },
  {
    question: "Posso assistir pelo celular?",
    answer: "Sim! Nossa plataforma e totalmente responsiva. Voce pode assistir as aulas pelo computador, tablet ou celular, em qualquer lugar e a qualquer momento."
  },
  {
    question: "Como recebo o certificado?",
    answer: "O certificado e gerado automaticamente apos voce completar 100% das aulas. Ele fica disponivel na area 'Certificado' do seu painel, onde voce pode baixar em PDF ou compartilhar diretamente."
  },
  {
    question: "Preciso de conhecimento previo?",
    answer: "Nao! O curso foi desenvolvido para todos os niveis. Comecamos do basico e avancamos gradualmente para conteudos mais tecnicos. Qualquer pessoa apaixonada por automobilismo consegue acompanhar."
  },
]

export default function SuportePage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSent(true)
    setSubject("")
    setMessage("")
    
    // Reset after 3 seconds
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Suporte</h1>
        <p className="text-muted-foreground">
          Estamos aqui para ajudar. Encontre respostas ou entre em contato.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQ Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>
              Respostas para as duvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Enviar Mensagem
            </CardTitle>
            <CardDescription>
              Nao encontrou sua resposta? Fale conosco diretamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Mensagem Enviada!
                </h3>
                <p className="text-muted-foreground">
                  Responderemos em ate 24 horas uteis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Ex: Duvida sobre pagamento"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Descreva sua duvida ou problema..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Email</h4>
              <p className="text-sm text-muted-foreground">equipeapexx@gmail.com</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Comunidade</h4>
              <p className="text-sm text-muted-foreground">Discord exclusivo para alunos</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Resposta</h4>
              <p className="text-sm text-muted-foreground">Ate 24 horas uteis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
