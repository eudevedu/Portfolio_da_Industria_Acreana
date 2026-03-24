"use client"

import React, { useState } from "react"
import { ExternalLink, Eye } from "lucide-react"
import { IndustrialDetailsModal } from "./IndustrialDetailsModal"
import type { Empresa } from "@/lib/supabase.types"

interface ViewProfileButtonProps {
  company: Empresa | null
  variant?: "sidebar" | "stats"
}

export function ViewProfileButton({ company, variant = "sidebar" }: ViewProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === "stats") {
    return (
      <>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 hover:scale-110 transition-transform"
        >
          <Eye className="h-5 w-5" />
        </button>
        <IndustrialDetailsModal isOpen={isOpen} onClose={() => setIsOpen(false)} company={company} />
      </>
    )
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium group w-full text-left"
      >
        <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
        <span>Ver Detalhes do Perfil</span>
      </button>
      <IndustrialDetailsModal isOpen={isOpen} onClose={() => setIsOpen(false)} company={company} />
    </>
  )
}
