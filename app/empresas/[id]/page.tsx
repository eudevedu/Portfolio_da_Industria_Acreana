import { buscarEmpresaPorId, buscarEmpresas } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import { notFound } from "next/navigation"
import EmpresaDetailContent from "@/components/EmpresaDetailContent"
import type { Empresa } from "@/lib/supabase.types"

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params
  const isConfigured = isSupabaseConfigured()

  let empresa: Empresa | null | undefined = null
  let empresasRelacionadas: Empresa[] = []
  
  try {
    if (isConfigured) {
      empresa = await buscarEmpresaPorId(empresaId)
      if (empresa) {
        const todasEmpresas = await buscarEmpresas()
        empresasRelacionadas = todasEmpresas
          .filter((e: any) => 
            e.id !== empresaId && 
            (e.segmento === empresa!.segmento || e.setor_economico === empresa!.setor_economico)
          )
          .slice(0, 6) as Empresa[]
      }
    } else {
      const mockEmpresas = await buscarEmpresas()
      empresa = mockEmpresas.find((emp) => emp.id === empresaId) as Empresa
      
      if (empresa) {
        empresasRelacionadas = mockEmpresas
          .filter((e) => 
            e.id !== empresaId && 
            (e.segmento === empresa!.segmento || e.setor_economico === empresa!.setor_economico)
          )
          .slice(0, 6) as Empresa[]
      }
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes da empresa:", error)
    notFound()
  }

  if (!empresa) {
    notFound()
  }

  return (
    <EmpresaDetailContent 
      initialEmpresa={empresa} 
      initialRelacionadas={empresasRelacionadas} 
    />
  )
}