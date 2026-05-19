"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, User, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface AuthorInfo {
  id: string
  name: string
  title: string | null
  bio: string | null
  achievements: string[] | null
  social_links: {
    instagram?: string
    youtube?: string
    linkedin?: string
  } | null
}

export default function AdminConfiguracoesPage() {
  const [author, setAuthor] = useState<AuthorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const loadAuthor = async () => {
      const { data } = await supabase
        .from("author_info")
        .select("*")
        .single()
      
      if (data) {
        setAuthor(data)
      }
      setLoading(false)
    }
    
    loadAuthor()
  }, [supabase])

  const handleSave = async () => {
    if (!author) return
    
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase
      .from("author_info")
      .update({
        name: author.name,
        title: author.title,
        bio: author.bio,
        achievements: author.achievements,
        social_links: author.social_links,
      })
      .eq("id", author.id)

    if (error) {
      setError("Erro ao salvar configuracoes")
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuracoes</h1>
          <p className="text-muted-foreground">
            Configure as informacoes do site e do autor
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alteracoes
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-500 bg-green-500/10 rounded-md">
          <CheckCircle className="h-4 w-4" />
          Configuracoes salvas com sucesso!
        </div>
      )}

      {/* Author Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informacoes do Autor
          </CardTitle>
          <CardDescription>
            Estas informacoes aparecem na pagina "Sobre o Autor"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={author?.name || ""}
                onChange={(e) => setAuthor(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Titulo/Cargo</Label>
              <Input
                id="title"
                value={author?.title || ""}
                onChange={(e) => setAuthor(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Ex: Especialista em Automobilismo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={author?.bio || ""}
              onChange={(e) => setAuthor(prev => prev ? { ...prev, bio: e.target.value } : null)}
              placeholder="Conte um pouco sobre voce..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Conquistas (uma por linha)</Label>
            <Textarea
              value={author?.achievements?.join("\n") || ""}
              onChange={(e) => setAuthor(prev => prev ? { 
                ...prev, 
                achievements: e.target.value.split("\n").filter(a => a.trim()) 
              } : null)}
              placeholder="Ex: Ex-engenheiro de equipe de corrida"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Redes Sociais
          </CardTitle>
          <CardDescription>
            Links para suas redes sociais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={author?.social_links?.instagram || ""}
                onChange={(e) => setAuthor(prev => prev ? { 
                  ...prev, 
                  social_links: { ...prev.social_links, instagram: e.target.value } 
                } : null)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={author?.social_links?.youtube || ""}
                onChange={(e) => setAuthor(prev => prev ? { 
                  ...prev, 
                  social_links: { ...prev.social_links, youtube: e.target.value } 
                } : null)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={author?.social_links?.linkedin || ""}
                onChange={(e) => setAuthor(prev => prev ? { 
                  ...prev, 
                  social_links: { ...prev.social_links, linkedin: e.target.value } 
                } : null)}
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
