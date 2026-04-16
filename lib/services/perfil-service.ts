"use server"

import { createServerSideClient, createAdminClient } from "../supabase"
import type { PerfilEmpresa } from "../supabase.types"

/**
 * Cria ou atualiza o perfil de contato vinculado a um ID de usuário (Auth).
 */
export async function criarPerfilEmpresa(
  userId: string,
  empresaId: string | null,
  profileData: Partial<PerfilEmpresa>,
): Promise<{ data: PerfilEmpresa | null; error: any }> {
  const supabase = await createServerSideClient()
  
  const perfilCompleto = {
    id: userId,
    empresa_id: empresaId,
    nome_contato: profileData.nome_contato || '',
    telefone: profileData.telefone || null,
    cargo: profileData.cargo || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("perfis_empresas")
    .upsert([perfilCompleto])
    .select()
    .single()

  return { data: data as PerfilEmpresa, error }
}

/**
 * Vincula uma empresa existente ao perfil de um usuário.
 */
export async function vincularEmpresaAoPerfil(
  userId: string,
  empresaId: string,
): Promise<{ success: boolean; error: any }> {
  const supabase = createAdminClient() // Usamos Admin Client para garantir o vínculo mesmo com RLS restrito no cadastro
  
  const { error } = await supabase
    .from("perfis_empresas")
    .update({ empresa_id: empresaId })
    .eq("id", userId)

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { empresa_id: empresaId }
  })

  if (error || authError) return { success: false, error: error || authError }
  return { success: true, error: null }
}
