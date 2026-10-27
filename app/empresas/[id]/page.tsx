import { buscarEmpresas } from "@/lib/public-actions"
import { notFound } from "next/navigation"
import EmpresaDetailContent from "@/components/EmpresaDetailContent"

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params
  const empresas = await buscarEmpresas()
  const empresa = empresas.find(item => item.id === empresaId)
  if (!empresa) notFound()

  const relacionadas = empresas.filter(item =>
    item.id !== empresaId &&
    (item.segmento === empresa.segmento || item.setor_economico === empresa.setor_economico)
  ).slice(0, 6)

  return <EmpresaDetailContent initialEmpresa={empresa} initialRelacionadas={relacionadas} />
}
