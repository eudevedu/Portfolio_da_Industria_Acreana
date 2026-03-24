"use client"

import React, { useState } from "react"
import { Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfiguracoesModal } from "./ConfiguracoesModal"

interface ConfiguracoesButtonProps {
  userEmail: string
  empresaId: string
  userType?: string
  userName?: string
  variant?: "sidebar" | "mobile"
}

export function ConfiguracoesButton({
  userEmail,
  empresaId,
  userType,
  userName,
  variant = "sidebar"
}: ConfiguracoesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === "mobile") {
    return (
      <>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(true)} 
          className="hover:bg-white/10 text-white"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
        <ConfiguracoesModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          userEmail={userEmail}
          empresaId={empresaId}
          userType={userType}
          userName={userName}
        />
      </>
    )
  }

  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => setIsOpen(true)}
        className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium group text-left h-auto"
      >
        <SettingsIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
        <span>Configurações</span>
      </Button>
      <ConfiguracoesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userEmail={userEmail}
        empresaId={empresaId}
        userType={userType}
        userName={userName}
      />
    </>
  )
}
