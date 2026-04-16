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
  const supabase = createAdminClient()
  if (!supabase) {
    console.error("Supabase Admin Client não disponível.")
    return false
  }

  try {
    const { data: profiles } = await supabase
      .from("perfis_empresas")
      .select("id")
      .eq("empresa_id", id)
    
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        await supabase.auth.admin.deleteUser(profile.id)
      }
    }

    await Promise.allSettled([
      supabase.from("analytics").delete().eq("empresa_id", id),
      supabase.from("produtos").delete().eq("empresa_id", id),
      supabase.from("arquivos").delete().eq("empresa_id", id),
      supabase.from("perfis_empresas").delete().eq("empresa_id", id)
    ])

    const { error } = await supabase.from("empresas").delete().eq("id", id)
    return !error
  } catch (err) {
    console.error("Erro ao excluir empresa:", err)
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
  const supabase = createAdminClient()
  if (!supabase) return null

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
  const supabase = createAdminClient()
  if (!supabase) return null

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

/**
 * Atualização completa (Sincronização) de empresa, produtos e arquivos.
 * Usado principalmente pelo Painel Administrativo.
 */
export async function atualizarEmpresaCompleta(id: string, fullData: any): Promise<boolean> {
  const supabase = createAdminClient()
  if (!supabase) return false

  try {
    // 1. Atualizar dados básicos da empresa
    const { empresa, produtos } = fullData
    
    // Removemos campos transientes
    const { 
      arquivos, 
      folder_apresentacao_url, 
      outros_arquivos_urls, 
      id: _, 
      created_at: __, 
      updated_at: ___, 
      ...empresaBase 
    } = empresa

    const { error: errorEmpresa } = await supabase
      .from("empresas")
      .update({ ...empresaBase, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (errorEmpresa) throw errorEmpresa

    // 2. Limpar produtos e registros de arquivos antigos (Sincronização Atômica)
    await supabase.from("produtos").delete().eq("empresa_id", id)
    await supabase.from("arquivos").delete().eq("empresa_id", id)

    const filePromises: Promise<any>[] = []

    // 3. Recriar registros de arquivos da empresa (Logo e Institucionais)
    if (empresa.logo_url) {
      filePromises.push(supabase.from("arquivos").insert({
        empresa_id: id, nome: "Logo da Empresa", url: empresa.logo_url, tipo: "imagem", categoria: "logo"
      }))
    }
    if (empresa.folder_apresentacao_url) {
      filePromises.push(supabase.from("arquivos").insert({
        empresa_id: id, nome: "Folder Institucional", url: empresa.folder_apresentacao_url, tipo: "pdf", categoria: "institucional_folder"
      }))
    }
    if (empresa.outros_arquivos_urls && empresa.outros_arquivos_urls.length > 0) {
      empresa.outros_arquivos_urls.forEach((url: string) => {
        filePromises.push(supabase.from("arquivos").insert({
          empresa_id: id, nome: "Outro Arquivo Institucional", url, tipo: url.endsWith(".pdf") ? "pdf" : "imagem", categoria: "institucional_outros"
        }))
      })
    }

    // 4. Recriar Produtos e seus respectivos vínculos de arquivos
    if (produtos && produtos.length > 0) {
      for (const p of produtos) {
        const { ficha_tecnica_url, folder_produto_url, imagens_produto_urls, ...pData } = p
        const { data: newProd, error: errorProd } = await supabase
          .from("produtos")
          .insert({ ...pData, empresa_id: id, status: "ativo" })
          .select()
          .single()

        if (newProd && !errorProd) {
          if (ficha_tecnica_url) {
            filePromises.push(supabase.from("arquivos").insert({
              empresa_id: id, nome: `Ficha Técnica - ${p.nome}`, url: ficha_tecnica_url, tipo: "pdf", categoria: "produto_ficha_tecnica"
            }))
          }
          if (folder_produto_url) {
            filePromises.push(supabase.from("arquivos").insert({
              empresa_id: id, nome: `Folder Produto - ${p.nome}`, url: folder_produto_url, tipo: "pdf", categoria: "produto_folder"
            }))
          }
          if (imagens_produto_urls && imagens_produto_urls.length > 0) {
            imagens_produto_urls.forEach((url: string) => {
              filePromises.push(supabase.from("arquivos").insert({
                empresa_id: id, nome: `Imagem Produto - ${p.nome}`, url, tipo: "imagem", categoria: "produto_imagem"
              }))
            })
          }
        }
      }
    }

    await Promise.all(filePromises)
    return true
  } catch (error) {
    console.error("Erro em atualizarEmpresaCompleta:", error)
    return false
  }
}

export async function deletarEmpresa(id: string): Promise<void> {
  const supabase = createAdminClient()
  if (!supabase) return
  await supabase.from("empresas").delete().eq("id", id)
}
