"use server"

import { createServerSideClient, createAdminClient } from "../supabase"
import type { Empresa } from "../supabase.types"

/**
 * Busca empresas com filtros. Suporta uso público e administrativo.
 */
export async function buscarEmpresas(filters?: {
  status?: string
  setor_economico?: string
  municipio?: string
  busca?: string
}): Promise<Empresa[]> {
  const supabase = await createServerSideClient()
  if (!supabase) return []

  let query = supabase.from("empresas").select("*, produtos(*), arquivos(*)")
  
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }
  if (filters?.setor_economico && filters.setor_economico !== "all") {
    query = query.eq("setor_economico", filters.setor_economico)
  }
  if (filters?.municipio && filters.municipio !== "all") {
    query = query.eq("municipio", filters.municipio)
  }
  if (filters?.busca) {
    query = query.or(
      `nome_fantasia.ilike.%${filters.busca}%,razao_social.ilike.%${filters.busca}%,cnpj.ilike.%${filters.busca}%,descricao_produtos.ilike.%${filters.busca}%,apresentacao.ilike.%${filters.busca}%`
    )
  }
  
  const { data, error } = await query.order("created_at", { ascending: false })
  
  if (error) {
    console.error("Erro [buscarEmpresas]:", error)
    return []
  }
  return data as Empresa[]
}

/**
 * Funções de compatibilidade para o painel administrativo e Home.
 */
export async function buscarEmpresasAdmin(filters?: Parameters<typeof buscarEmpresas>[0]) {
  return buscarEmpresas(filters)
}

export async function getLastCompanies(): Promise<Empresa[]> {
  const supabase = await createServerSideClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("empresas")
    .select("*, produtos(*), arquivos(*)")
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(8)

  if (error) {
    console.error("Erro [getLastCompanies]:", error)
    return []
  }
  return data as Empresa[]
}

export async function atualizarStatusEmpresa(
  id: string,
  newStatus: "ativo" | "pendente" | "inativo",
): Promise<Empresa | null> {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("empresas")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return null
  return data as Empresa
}

export async function excluirEmpresa(id: string): Promise<boolean> {
  // Usamos createAdminClient (Service Role) para garantir que possamos limpar 
  // todos os registros vinculados e contornar restrições de RLS no painel administrativo.
  const supabase = createAdminClient()
  if (!supabase) {
    console.error("Supabase Admin Client não disponível. Verifique SUPABASE_SERVICE_ROLE_KEY.")
    return false
  }

  try {
    console.log(`Iniciando exclusão completa para empresa ID: ${id}`)

    // 1. Identificar e deletar usuários vinculados no Supabase Auth
    // Buscamos na tabela perfis_empresas antes de deletar a empresa
    const { data: profiles, error: errorSearchPerf } = await supabase
      .from("perfis_empresas")
      .select("id")
      .eq("empresa_id", id)
    
    if (errorSearchPerf) {
      console.warn("Aviso ao buscar perfis vinculados:", errorSearchPerf.message)
    }

    if (profiles && profiles.length > 0) {
      console.log(`Encontrados ${profiles.length} usuários vinculados. Removendo do Auth...`)
      for (const profile of profiles) {
        const { error: errorAuth } = await supabase.auth.admin.deleteUser(profile.id)
        if (errorAuth) {
          console.warn(`Erro ao deletar usuário ${profile.id} do Auth:`, errorAuth.message)
        } else {
          console.log(`Usuário ${profile.id} removido do Auth com sucesso.`)
        }
      }
    }

    // 2. Limpeza manual de dados relacionados (para garantir, caso o CASCADE do DB falhe)
    // Deletar analytics, produtos e arquivos
    await Promise.allSettled([
      supabase.from("analytics").delete().eq("empresa_id", id),
      supabase.from("produtos").delete().eq("empresa_id", id),
      supabase.from("arquivos").delete().eq("empresa_id", id),
      supabase.from("perfis_empresas").delete().eq("empresa_id", id)
    ])

    // 3. Deletar a empresa propriamente dita
    const { error } = await supabase.from("empresas").delete().eq("id", id)
    
    if (error) {
      console.error("Erro crítico ao excluir empresa [PostgrestError]:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }
    
    console.log(`Empresa ${id} e todos os dados vinculados excluídos com sucesso.`)
    return true
  } catch (err: any) {
    console.error("Erro inesperado no processo de exclusão:", err?.message || err)
    return false
  }
}

export async function buscarEmpresaPorId(id: string): Promise<Empresa | null> {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("empresas")
    .select("*, produtos(*), arquivos(*)")
    .eq("id", id)
    .single()
    
  if (error) return null
  return data as Empresa
}

export async function criarEmpresa(
  empresa: Omit<Empresa, "id" | "created_at" | "updated_at" | "status" | "produtos" | "arquivos" | "perfil_empresa">,
): Promise<Empresa | null> {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  // Remove campos que não existem na tabela do banco de dados (campos transientes do formulário)
  const { 
    outros_arquivos_urls, 
    folder_apresentacao_url, 
    produtos, 
    arquivos, 
    perfil_empresa, 
    relacionadas,
    ...dadosValidos 
  } = empresa as any

  const { data, error } = await supabase
    .from("empresas")
    .insert([{ ...dadosValidos, status: "pendente" }])
    .select()
    .single()
    
  if (error) throw new Error(`Erro ao criar empresa: ${error.message}`)
  return data as Empresa
}

export async function atualizarEmpresa(id: string, updates: Partial<Empresa>): Promise<Empresa | null> {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  // Remove campos que não existem na tabela do banco de dados
  const { 
    outros_arquivos_urls, 
    folder_apresentacao_url, 
    produtos, 
    arquivos, 
    perfil_empresa, 
    relacionadas,
    ...dadosValidos 
  } = updates as any

  const { data, error } = await supabase
    .from("empresas")
    .update({ ...dadosValidos, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return null
  return data as Empresa
}

export async function deletarEmpresa(id: string): Promise<void> {
  const supabase = await createServerSideClient()
  if (!supabase) return
  await supabase.from("empresas").delete().eq("id", id)
}
