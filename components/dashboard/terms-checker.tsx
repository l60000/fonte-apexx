"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TermsModal } from "@/components/terms-modal"

interface TermsCheckerProps {
  userId: string
}

export function TermsChecker({ userId }: TermsCheckerProps) {
  const [showTerms, setShowTerms] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkTerms = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("terms_accepted")
        .eq("id", userId)
        .single()

      if (profile && !profile.terms_accepted) {
        setShowTerms(true)
      }
      setLoading(false)
    }

    checkTerms()
  }, [userId, supabase])

  if (loading) return null

  return (
    <TermsModal 
      open={showTerms} 
      onAccept={() => setShowTerms(false)}
    />
  )
}
