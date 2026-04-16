"use server"

import { createServerSideClient, createAdminClient } from "../supabase"
import type { Arquivo } from "../supabase.types"

export async function criarArquivo(arquivo: Omit<Arquivo, "id" | "created_at">): Promise<{ data: Arquivo | null, error: any }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("arquivos")
    .insert([arquivo])
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: data as Arquivo, error: null }
}

export async function buscarArquivosPorEmpresa(empresaId: string): Promise<Arquivo[]> {
  const supabase = await createServerSideClient()
  const { data, error } = await supabase
    .from('arquivos')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function deletarArquivo(id: string): Promise<void> {
  const supabase = await createServerSideClient()
  const { error } = await supabase.from("arquivos").delete().eq("id", id)
  if (error) console.error("Erro ao deletar arquivo:", error)
}
