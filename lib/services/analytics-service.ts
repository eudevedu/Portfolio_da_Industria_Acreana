"use server"

import { createServerSideClient } from "../supabase"

/**
 * Busca estatísticas globais para a página inicial.
 */
export async function obterEstatisticasHome() {
  const supabase = await createServerSideClient()
  
  if (!supabase) {
    return { totalEmpresas: 0, totalProdutos: 0, totalMunicipios: 0 }
  }

  // Usamos RPC ou queries paralelas para contagens globais
  const [empresas, produtos, municipios] = await Promise.all([
    supabase.from("empresas").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("produtos").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("empresas").select("municipio")
  ])

  // Extrair municípios únicos
  const municipiosUnicos = new Set(municipios.data?.map(m => m.municipio).filter(Boolean) || [])

  return {
    totalEmpresas: empresas.count || 0,
    totalProdutos: produtos.count || 0,
    totalMunicipios: municipiosUnicos.size || 0
  }
}

/**
 * Estatísticas detalhadas para o painel de administração.
 */
export async function obterEstatisticasAdmin() {
  const supabase = await createServerSideClient()

  if (!supabase) {
    return {
      totalEmpresas: 0,
      empresasAtivas: 0,
      empresasPendentes: 0,
      empresasInativas: 0,
      novosCadastrosMes: 0,
      totalProdutos: 0,
      visualizacoesTotais: 0,
    }
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    total, 
    ativas, 
    pendentes, 
    inativas, 
    novas, 
    produtos, 
    views
  ] = await Promise.all([
    supabase.from("empresas").select("id", { count: "exact", head: true }),
    supabase.from("empresas").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("empresas").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("empresas").select("id", { count: "exact", head: true }).eq("status", "inativo"),
    supabase.from("empresas").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    supabase.from("produtos").select("id", { count: "exact", head: true }),
    supabase.from("analytics").select("id", { count: "exact", head: true }).eq("tipo_evento", "visualizacao_perfil")
  ])

  return {
    totalEmpresas: total.count || 0,
    empresasAtivas: ativas.count || 0,
    empresasPendentes: pendentes.count || 0,
    empresasInativas: inativas.count || 0,
    novosCadastrosMes: novas.count || 0,
    totalProdutos: produtos.count || 0,
    visualizacoesTotais: views.count || 0,
  }
}

/**
 * Estatísticas específicas de uma empresa (usada no dashboard da empresa).
 */
export async function obterAnalytics(empresaId: string) {
  const supabase = await createServerSideClient()
  if (!supabase) return { totalVisualizacoes: 0, visualizacoesMes: 0, produtosDoMes: 0, produtosMaisVistos: [] }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [totalViews, monthViews, productsOfMonth] = await Promise.all([
    supabase.from("analytics").select("id", { count: "exact" }).eq("empresa_id", empresaId).eq("tipo_evento", "visualizacao_perfil"),
    supabase.from("analytics").select("id", { count: "exact" }).eq("empresa_id", empresaId).eq("tipo_evento", "visualizacao_perfil").gte("timestamp", startOfMonth.toISOString()),
    supabase.from("produtos").select("id", { count: "exact" }).eq("empresa_id", empresaId).gte("created_at", startOfMonth.toISOString())
  ])

  return {
    totalVisualizacoes: totalViews.count || 0,
    visualizacoesMes: monthViews.count || 0,
    produtosDoMes: productsOfMonth.count || 0,
    produtosMaisVistos: []
  }
}

export async function buscarProdutosMaisVisualizados(limite: number = 6) {
  const supabase = await createServerSideClient()
  if (!supabase) return []
  
  const { data: analyticsData } = await supabase
    .from('analytics')
    .select('referencia_id')
    .eq('tipo_evento', 'visualizacao_produto')
    .not('referencia_id', 'is', null)

  if (!analyticsData) return []

  const viewCounts: Record<string, number> = {}
  analyticsData.forEach(item => {
    if (item.referencia_id) viewCounts[item.referencia_id] = (viewCounts[item.referencia_id] || 0) + 1
  })

  const topIds = Object.entries(viewCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limite)
    .map(([id]) => id)

  if (topIds.length === 0) return []

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*, empresas(id, nome_fantasia, logo_url)')
    .in('id', topIds)

  return produtos || []
}
