"use server"

import { createServerSideClient } from "../supabase"

export type Categoria = {
  id: string
  nome: string
  slug: string
  tipo: "setor_economico" | "atividade_principal"
  parent_id?: string | null
  created_at: string
}

export async function buscarCategorias(tipo?: string, parentId?: string) {
  const supabase = await createServerSideClient()
  if (!supabase) return []

  let query = supabase.from("categorias").select("*")
  if (tipo) query = query.eq("tipo", tipo)
  if (parentId) query = query.eq("parent_id", parentId)
  
  const { data, error } = await query.order("nome")
  if (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }
  return data as Categoria[]
}

export async function criarCategoria(categoria: { nome: string; tipo: string; parent_id?: string | null }) {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  const slug = categoria.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
  
  const { data, error } = await supabase.from("categorias").insert([{ ...categoria, slug }]).select().single()
  if (error) {
    console.error("Erro ao criar categoria:", error)
    return null
  }
  return data as Categoria
}

export async function atualizarCategoria(id: string, updates: Partial<Categoria>) {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  const { data, error } = await supabase.from("categorias").update(updates).eq("id", id).select().single()
  if (error) {
    console.error("Erro ao atualizar categoria:", error)
    return null
  }
  return data as Categoria
}

export async function excluirCategoria(id: string) {
  const supabase = await createServerSideClient()
  if (!supabase) return false

  const { error } = await supabase.from("categorias").delete().eq("id", id)
  return !error
}
