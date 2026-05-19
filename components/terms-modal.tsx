"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface TermsModalProps {
  open: boolean
  onAccept?: () => void
}

export function TermsModal({ open, onAccept }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAccept = async () => {
    if (!accepted) return

    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from("profiles")
          .update({
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString()
          })
          .eq("id", user.id)
      }

      if (onAccept) {
        onAccept()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error accepting terms:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Política Geral do Site</DialogTitle>
          <DialogDescription>
            Última atualização: 12/02/2026
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm text-foreground">
            <p className="text-muted-foreground">
              Este documento estabelece as políticas gerais que regem o uso do site, seus serviços, conteúdos e interações. Ao acessar ou utilizar este site, você concorda integralmente com os termos descritos abaixo.
            </p>

            <div>
              <h3 className="font-semibold text-base mb-2">1. Aceitação dos Termos</h3>
              <p className="text-muted-foreground">
                Ao navegar, criar conta, interagir ou utilizar qualquer funcionalidade deste site, o usuário declara estar de acordo com esta política. Caso não concorde, recomenda-se interromper imediatamente o uso da plataforma.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">2. Cadastro e Conta do Usuário</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>O usuário é responsável por fornecer informações verdadeiras, atualizadas e completas no momento do cadastro.</li>
                <li>Cada conta é pessoal e intransferível.</li>
                <li>O usuário é responsável por manter a confidencialidade de seus dados de acesso.</li>
                <li>O site reserva-se o direito de suspender ou excluir contas que violem estas políticas.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">3. Conduta do Usuário</h3>
              <p className="text-muted-foreground mb-2">É proibido:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Publicar conteúdos ofensivos, discriminatórios, violentos, ilegais ou que violem direitos de terceiros.</li>
                <li>Praticar assédio, discurso de ódio, spam ou qualquer forma de abuso.</li>
                <li>Tentar explorar falhas técnicas, realizar ataques, ou interferir no funcionamento do site.</li>
                <li>Usar o site para fins fraudulentos ou ilícitos.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                O descumprimento pode resultar em advertência, suspensão temporária ou banimento definitivo.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">4. Conteúdo Gerado pelo Usuário</h3>
              <p className="text-muted-foreground">
                O usuário mantém os direitos sobre o conteúdo que publica, mas concede ao site uma licença gratuita, não exclusiva e global para usar, exibir, armazenar e divulgar esse conteúdo dentro da plataforma. O site não se responsabiliza por conteúdos publicados por usuários, mas poderá removê-los a qualquer momento se considerar necessário.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">5. Propriedade Intelectual</h3>
              <p className="text-muted-foreground">
                Todo o conteúdo do site (textos, imagens, logotipos, layout, códigos e funcionalidades) é protegido por direitos autorais e pertence ao site ou a seus licenciadores. É proibida a reprodução, modificação ou redistribuição sem autorização prévia.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">6. Privacidade e Proteção de Dados</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Os dados coletados são utilizados apenas para fins operacionais, de segurança e melhoria dos serviços.</li>
                <li>O site compromete-se a proteger as informações pessoais dos usuários conforme a legislação aplicável.</li>
                <li>O usuário pode solicitar a correção ou exclusão de seus dados, conforme permitido por lei.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">7. Segurança da Plataforma</h3>
              <p className="text-muted-foreground">
                O site adota medidas razoáveis para proteger seus sistemas e informações. No entanto, não é possível garantir segurança absoluta contra falhas técnicas, ataques cibernéticos ou interrupções.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">8. Disponibilidade do Serviço</h3>
              <p className="text-muted-foreground">
                O site pode ser temporariamente interrompido para manutenção, atualizações ou por fatores externos. Não há garantia de funcionamento ininterrupto.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">9. Limitação de Responsabilidade</h3>
              <p className="text-muted-foreground">
                O site não se responsabiliza por danos diretos ou indiretos resultantes do uso ou da impossibilidade de uso da plataforma. O uso é de inteira responsabilidade do usuário.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">10. Links Externos</h3>
              <p className="text-muted-foreground">
                O site pode conter links para plataformas de terceiros. Não nos responsabilizamos pelo conteúdo, políticas ou práticas desses sites externos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">11. Modificações da Política</h3>
              <p className="text-muted-foreground">
                Esta política pode ser alterada a qualquer momento, sem aviso prévio. Recomenda-se que o usuário revise periodicamente este documento.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">12. Encerramento de Acesso</h3>
              <p className="text-muted-foreground">
                O site reserva-se o direito de suspender ou encerrar o acesso de qualquer usuário que viole estas políticas, sem necessidade de aviso prévio.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">13. Legislação Aplicável</h3>
              <p className="text-muted-foreground">
                Esta política é regida pelas leis vigentes no território nacional, sendo competente o foro da comarca do responsável legal pelo site.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">14. Contato</h3>
              <p className="text-muted-foreground">
                Em caso de dúvidas, sugestões ou solicitações relacionadas a esta política, entre em contato pelo canal oficial do site.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Li e aceito os termos de uso e políticas do site
            </label>
          </div>
          <Button 
            onClick={handleAccept} 
            disabled={!accepted || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aceitando...
              </>
            ) : (
              "Aceitar e Continuar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
