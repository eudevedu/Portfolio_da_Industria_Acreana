"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"

export function AcessoForm() {
  const { register, formState: { errors } } = useFormContext<CadastroFormData>()

  return (
    <div className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("acesso.email")}
            placeholder="exemplo@email.com"
          />
          {errors.acesso?.email && (
            <p className="text-red-500 text-xs">{errors.acesso.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            type="password"
            {...register("acesso.password")}
            placeholder="********"
          />
          {errors.acesso?.password && (
            <p className="text-red-500 text-xs">{errors.acesso.password.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("acesso.confirmPassword")}
            placeholder="********"
          />
          {errors.acesso?.confirmPassword && (
            <p className="text-red-500 text-xs">{errors.acesso.confirmPassword.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Nome do Contato Principal *</Label>
          <Input
            id="contactName"
            {...register("acesso.contactName")}
            placeholder="Seu nome completo"
          />
          {errors.acesso?.contactName && (
            <p className="text-red-500 text-xs">{errors.acesso.contactName.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Telefone de Contato</Label>
          <Input
            id="contactPhone"
            {...register("acesso.contactPhone")}
            placeholder="(XX) XXXXX-XXXX"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactRole">Cargo / Função</Label>
          <Input
            id="contactRole"
            {...register("acesso.contactRole")}
            placeholder="Ex: Diretor, Gestor"
          />
        </div>
      </div>
    </div>
  )
}
