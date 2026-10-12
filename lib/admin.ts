"use server"

import { requireAdmin } from "./auth-guards"
import * as empresaService from "./services/empresa-service"
import * as adminService from "./services/admin-service"
import * as analyticsService from "./services/analytics-service"
import { createServerSideClient } from "./supabase"
import type { Empresa, Admin } from "./supabase.types"

/**
 * Obtém estatísticas globais para o dashboard administrativo
 */
export async function obterEstatisticasAdmin() {
  await requireAdmin()
  
  const supabase = await createServerSideClient()
  
  const { count: totalEmpresas } = await supabase.from("empresas").select("id", { count: "exact", head: true })
  const { count: empresasAtivas } = await supabase.from("empresas").select("id", { count: "exact", head: true }).eq("status", "ativo")
  const { count: empresasPendentes } = await supabase.from("empresas").select("id", { count: "exact", head: true }).eq("status", "pendente")
  
  const { count: totalProdutos } = await supabase.from("produtos").select("id", { count: "exact", head: true })

  return {
    totalEmpresas: totalEmpresas || 0,
    empresasAtivas: empresasAtivas || 0,
    empresasPendentes: empresasPendentes || 0,
    empresasInativas: (totalEmpresas || 0) - (empresasAtivas || 0) - (empresasPendentes || 0),
    novosCadastrosMes: 0, // Implementar query de data se necessário
    totalProdutos: totalProdutos || 0,
    visualizacoesTotais: 0,
  }
}

/**
 * Busca empresas com permissão administrativa
 */
export async function buscarEmpresasAdmin(filters?: any) {
  await requireAdmin()
  return empresaService.buscarEmpresas(filters)
}

/**
 * Atualiza o status de uma empresa (Aprovação/Bloqueio)
 */
export async function atualizarStatusEmpresa(id: string, newStatus: "ativo" | "pendente" | "inativo") {
  await requireAdmin()
  return empresaService.atualizarStatusEmpresa(id, newStatus)
}

/**
 * Cria um novo administrador
 */
export async function criarAdmin(dados: any) {
  await requireAdmin()
  return adminService.criarAdmin(dados)
}

/**
 * Lista todos os administradores
 */
export async function obterTodosAdmins() {
  await requireAdmin()
  return adminService.obterTodosAdmins()
}

/**
 * Exclui uma empresa permanentemente
 */
export async function excluirEmpresa(id: string) {
  await requireAdmin()
  return empresaService.excluirEmpresa(id)
}

/**
 * Funções de compatibilidade (Legado)
 */
export async function atualizarStatusAdmin(id: string, ativo: boolean) {
  await requireAdmin()
  return adminService.atualizarStatusAdmin(id, ativo)
}
