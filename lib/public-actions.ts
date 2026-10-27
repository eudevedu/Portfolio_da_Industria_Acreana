"use server"

import { getPublicCatalog } from "./public-catalog"

export async function buscarEmpresas(filters?: {
  status?: string; setor_economico?: string; setor_empresa?: string; municipio?: string; busca?: string
}) {
  const { empresas } = await getPublicCatalog()
  const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  return empresas.filter(empresa => {
    if (empresa.status !== "ativo") return false
    for (const key of ["status", "setor_economico", "setor_empresa", "municipio"] as const) {
      const value = filters?.[key]
      if (value && value !== "all" && empresa[key] !== value) return false
    }
    const search = normalize(filters?.busca?.trim() || "")
    return !search || [empresa.nome_fantasia, empresa.razao_social, empresa.cnpj,
      empresa.descricao_produtos, empresa.apresentacao, ...(empresa.produtos || []).map(p => p.nome)]
      .some(value => value && normalize(value).includes(search))
  })
}

export async function buscarEmpresaPorId(id: string) {
  return (await buscarEmpresas()).find(empresa => empresa.id === id) || null
}

export async function getLastCompanies(limit = 6) {
  return (await buscarEmpresas()).slice(0, limit)
}

export async function buscarCategorias(tipo?: string, parentId?: string) {
  return (await getPublicCatalog()).categorias.filter(c => (!tipo || c.tipo === tipo) && (!parentId || c.parent_id === parentId))
}

export async function obterEstatisticasHome() {
  const empresas = await buscarEmpresas()
  return {
    totalEmpresas: empresas.length,
    totalProdutos: empresas.reduce((total, empresa) => total + (empresa.produtos?.length || 0), 0),
    totalMunicipios: 22,
  }
}
