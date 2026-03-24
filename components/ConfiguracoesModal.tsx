"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Settings as SettingsIcon, ShieldCheck, User } from "lucide-react"
import ConfiguracoesEmpresa from "./ConfiguracoesEmpresa"

interface ConfiguracoesModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  empresaId: string
  userType?: string
  userName?: string
}

export function ConfiguracoesModal({
  isOpen,
  onClose,
  userEmail,
  empresaId,
  userType,
  userName
}: ConfiguracoesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-none p-0 border-none shadow-2xl bg-white select-none">
        {/* Superior Header with Design Premium */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                <SettingsIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black tracking-tight uppercase">Configurações de Conta</h2>
                  <div className="px-2 py-0.5 rounded-md bg-green-500/20 border border-green-500/30 text-[9px] font-black uppercase tracking-widest text-green-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Secure Access
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  {userName || userEmail} • {userType === 'admin' ? 'Painel Administrativo' : 'Gestor Industrial'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50">
          <ConfiguracoesEmpresa 
            userEmail={userEmail} 
            empresaId={empresaId} 
            userType={userType} 
          />
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-slate-400">
            <User className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sessão Ativa: {userEmail}</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
          >
            Fechar Painel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
