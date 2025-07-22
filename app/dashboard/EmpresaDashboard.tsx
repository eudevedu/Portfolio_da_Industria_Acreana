"use client"
import { useForm } from "react-hook-form"
import { Empresa } from "@/lib/supabase.types"
import { atualizarEmpresa } from "@/lib/database"

interface EmpresaDashboardProps {
  empresa: Empresa
  onAtualizado?: () => void
}

export function EmpresaDashboard({ empresa, onAtualizado }: EmpresaDashboardProps) {
  const { register, handleSubmit, formState, reset } = useForm<Empresa>({
    defaultValues: empresa,
  })

  async function onSubmit(data: Empresa) {
    const atualizada = await atualizarEmpresa(empresa.id, { ...data })
    if (atualizada && onAtualizado) onAtualizado()
    reset(atualizada || empresa)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nome Fantasia</label>
        <input {...register("nome_fantasia")} className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">Razão Social</label>
        <input {...register("razao_social")} className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">CNPJ</label>
        <input {...register("cnpj")} className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">Endereço</label>
        <input {...register("endereco")} className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">Instagram</label>
        <input {...register("instagram")} className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">Facebook</label>
        <input {...register("facebook")} className="input" />
      </div>
      {/* Adicione outros campos conforme necessário */}
      <button type="submit" className="btn btn-primary">Salvar Alterações</button>
    </form>
  )
}

