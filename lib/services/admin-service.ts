"use server"

import { createServerSideClient, createAdminClient } from "../supabase"
import type { Admin } from "../supabase.types"

/**
 * Cria um novo administrador no sistema (Auth + Tabela Admins).
 */
export async function criarAdmin(dadosAdmin: {
  nome: string
  email: string
  password: string
  cargo?: string
}): Promise<Admin | null> {
  const adminClient = createAdminClient()
  const supabase = await createServerSideClient()
  
  if (!adminClient || !supabase) {
    throw new Error("Supabase não configurado corretamente para operações administrativas.")
  }

  try {
    // 1. Criar usuário no Auth (Service Role)
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: dadosAdmin.email,
      password: dadosAdmin.password,
      email_confirm: true,
      user_metadata: {
        tipo: 'admin',
        nome: dadosAdmin.nome
      }
    })

    if (authError) throw authError

    // 2. Registrar na tabela public.admins
    const { data, error: tableError } = await supabase
      .from("admins")
      .insert({
        id: authUser.user.id,
        nome: dadosAdmin.nome,
        email: dadosAdmin.email,
        cargo: dadosAdmin.cargo,
        ativo: true
      })
      .select()
      .single()

    if (tableError) throw tableError
    return data as Admin

  } catch (error: any) {
    console.error("Erro ao criar administrador:", error)
    throw error
  }
}

/**
 * Retorna todos os administradores cadastrados.
 */
export async function obterTodosAdmins(): Promise<Admin[]> {
  const supabase = await createServerSideClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return []
  return data as Admin[]
}

/**
 * Ativa ou desativa um administrador.
 */
export async function atualizarStatusAdmin(id: string, ativo: boolean): Promise<Admin | null> {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("admins")
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return null
  return data as Admin
}
