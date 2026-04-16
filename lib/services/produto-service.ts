"use server"

import { createServerSideClient } from "../supabase"
import type { Produto } from "../supabase.types"

/**
 * Busca todos os produtos de uma empresa específica.
 */
export async function buscarProdutosPorEmpresa(empresaId: string): Promise<Produto[]> {
  const supabase = await createServerSideClient()
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false })
    
  if (error) return []
  return data as Produto[]
}

/**
 * Busca um produto específico pelo ID.
 */
export async function buscarProdutoPorId(id: string): Promise<Produto | null> {
  const supabase = await createServerSideClient()
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", id)
    .single()
    
  if (error) return null
  return data as Produto
}

/**
 * Cria um novo produto.
 */
export async function criarProduto(
  produto: Omit<Produto, "id" | "created_at" | "updated_at">,
): Promise<Produto | null> {
  const supabase = await createServerSideClient()
  const { data, error } = await supabase
    .from("produtos")
    .insert([{ ...produto, status: "ativo" }])
    .select()
    .single()
    
  if (error) {
    console.error("Erro [criarProduto]:", error)
    return null
  }
  return data as Produto
}

/**
 * Atualiza um produto.
 */
export async function atualizarProduto(id: string, updates: Partial<Produto>): Promise<Produto | null> {
  const supabase = await createServerSideClient()
  const { data, error } = await supabase
    .from("produtos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
    
  if (error) return null
  return data as Produto
}

/**
 * Remove um produto.
 */
export async function deletarProduto(id: string): Promise<void> {
  const supabase = await createServerSideClient()
  const { error } = await supabase.from("produtos").delete().eq("id", id)
  if (error) throw error
}
