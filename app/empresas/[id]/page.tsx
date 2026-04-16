import { buscarEmpresaPorId, buscarEmpresas } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import { notFound } from "next/navigation"
import EmpresaContent from "@/components/EmpresaContent"
import type { Empresa } from "@/lib/supabase.types"

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params
  const isConfigured = isSupabaseConfigured()

  let empresa: Empresa | null | undefined = null
  let empresasRelacionadas: Empresa[] = []
  
  if (isConfigured) {
    try {
      empresa = await buscarEmpresaPorId(empresaId)
      if (empresa) {
        const todasEmpresas = await buscarEmpresas()
        empresasRelacionadas = todasEmpresas
          .filter((e) => 
            e.id !== empresaId && 
            (e.segmento === empresa!.segmento || e.setor_economico === empresa!.setor_economico)
          )
          .slice(0, 6) as Empresa[]
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da empresa:", error)
      notFound()
    }
  } else {
    // Mock logic for development without Supabase
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

  if (!empresa) {
    notFound()
  }

  return <EmpresaContent initialEmpresa={empresa} initialRelacionadas={empresasRelacionadas} />
}