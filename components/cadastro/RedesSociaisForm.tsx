"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"

export function RedesSociaisForm() {
  const { register } = useFormContext<CadastroFormData>()

  return (
    <div className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail de Contato *</Label>
          <Input id="email" {...register("empresa.email")} placeholder="contato@empresa.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone de Contato *</Label>
          <Input id="telefone" {...register("empresa.telefone")} placeholder="(XX) XXXXX-XXXX" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" {...register("empresa.instagram")} placeholder="@empresa" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input id="facebook" {...register("empresa.facebook")} placeholder="facebook.com/empresa" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" {...register("empresa.linkedin")} placeholder="linkedin.com/company/empresa" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">X (Twitter)</Label>
          <Input id="twitter" {...register("empresa.twitter")} placeholder="@empresa" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input id="youtube" {...register("empresa.youtube")} placeholder="youtube.com/suaempresa" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="video_apresentacao">Vídeo de Apresentação (YouTube)</Label>
          <Input id="video_apresentacao" {...register("empresa.video_apresentacao")} placeholder="https://youtube.com/watch?v=..." />
        </div>
      </div>
    </div>
  )
}
