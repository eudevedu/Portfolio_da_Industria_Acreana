"use server"

import { createServerSideClient } from "./supabase"
import { requireAuth, requireEmpresa } from "./auth-guards"
import * as empresaService from "./services/empresa-service"
import * as produtoService from "./services/produto-service"
import * as arquivoService from "./services/arquivo-service"
import * as analyticsService from "./services/analytics-service"
import * as perfilService from "./services/perfil-service"
import type { Empresa, Produto, Arquivo } from "./supabase.types"

// --- EMPRESAS ---

export async function buscarEmpresas(filters?: any) {
  return empresaService.buscarEmpresas(filters)
}

export async function buscarEmpresaPorId(id: string) {
  return empresaService.buscarEmpresaPorId(id)
}

export async function criarEmpresa(empresa: any) {
  await requireAuth() // Qualquer usuário logado pode tentar criar uma empresa (será pendente)
  return empresaService.criarEmpresa(empresa)
}

export async function atualizarEmpresa(id: string, updates: any) {
  await requireEmpresa(id) // Passamos o id da própria empresa para validar posse
  return empresaService.atualizarEmpresa(id, updates)
}

export async function deletarEmpresa(id: string) {
  await requireEmpresa(id)
  return empresaService.deletarEmpresa(id)
}

// --- PRODUTOS ---

export async function buscarProdutosPorEmpresa(empresaId: string) {
  return produtoService.buscarProdutosPorEmpresa(empresaId)
}

export async function criarProduto(produto: any) {
  await requireEmpresa(produto.empresa_id)
  return produtoService.criarProduto(produto)
}

export async function atualizarProduto(id: string, updates: any) {
  const supabase = await createServerSideClient()
  const { data } = await supabase.from("produtos").select("empresa_id").eq("id", id).single()
  if (data) await requireEmpresa(data.empresa_id)
  
  return produtoService.atualizarProduto(id, updates)
}

export async function deletarProduto(id: string) {
  const supabase = await createServerSideClient()
  const { data } = await supabase.from("produtos").select("empresa_id").eq("id", id).single()
  if (data) await requireEmpresa(data.empresa_id)
  
  return produtoService.deletarProduto(id)
}

// --- ARQUIVOS ---

export async function buscarArquivosPorEmpresa(empresaId: string) {
  return arquivoService.buscarArquivosPorEmpresa(empresaId)
}

export async function criarArquivo(arquivo: any) {
  await requireEmpresa(arquivo.empresa_id)
  return arquivoService.criarArquivo(arquivo)
}

export async function deletarArquivo(id: string) {
  const supabase = await createServerSideClient()
  const { data } = await supabase.from("arquivos").select("empresa_id").eq("id", id).single()
  if (data) await requireEmpresa(data.empresa_id)
  
  return arquivoService.deletarArquivo(id)
}

// --- ANALYTICS / OUTROS ---

export async function obterAnalytics(empresaId: string) {
  await requireEmpresa(empresaId)
  return analyticsService.obterAnalytics(empresaId)
}

export async function buscarProdutosMaisVisualizados(limite: number = 6) {
  return analyticsService.buscarProdutosMaisVisualizados(limite)
}

// Funções de compatibilidade para Home
export async function obterEstatisticasHome() {
  const supabase = await createServerSideClient()
  const { count: empresas } = await supabase.from("empresas").select("id", { count: "exact", head: true }).eq("status", "ativo")
  const { count: produtos } = await supabase.from("produtos").select("id", { count: "exact", head: true })
  
  return {
    totalEmpresas: empresas || 0,
    totalProdutos: produtos || 0,
    municipiosAtendidos: 22,
  }
}

/**
 * Funções de compatibilidade (Legado)
 */
export async function vincularEmpresaAoPerfil(userId: string, empresaId: string) {
  // Apenas admins ou o próprio usuário (idealmente) poderiam vincular
  await requireAuth() 
  return perfilService.vincularEmpresaAoPerfil(userId, empresaId)
}
