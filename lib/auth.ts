"use server"

import { redirect } from "next/navigation"
import { createServerSideClient, createAdminClient } from "./supabase"
import type { User } from "./supabase.types"

/**
 * Realiza o login do usuário utilizando Supabase Auth.
 */
export async function login(email: string, password: string): Promise<{ success: boolean; message: string; tipo?: string }> {
  try {
    const supabase = await createServerSideClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.code === 'invalid_credentials') {
        return { success: false, message: "Email ou senha incorretos." }
      }
      return { success: false, message: error.message }
    }

    if (data.user) {
      // Validamos o usuário contra o banco de dados imediatamente
      const resolvedUser = await getCurrentUser()
      
      if (!resolvedUser) {
        await supabase.auth.signOut()
        return { success: false, message: "Acesso não autorizado. Perfil não encontrado." }
      }

      // Garantimos que o Auth saiba o tipo correto para o Middleware
      if (data.user.user_metadata?.tipo !== resolvedUser.tipo) {
        await supabase.auth.updateUser({
          data: { tipo: resolvedUser.tipo, isSuperAdmin: resolvedUser.isSuperAdmin }
        })
      }

      return { success: true, message: "Login bem-sucedido!", tipo: resolvedUser.tipo }
    }

    return { success: false, message: "Erro inesperado durante o login." }
  } catch (error: any) {
    console.error("Auth Error [login]:", error)
    return { success: false, message: "Erro de conexão com o servidor." }
  }
}

/**
 * Realiza o logout do usuário.
 */
export async function logout(): Promise<void> {
  const supabase = await createServerSideClient()
  await supabase.auth.signOut()
  redirect("/")
}

/**
 * Verifica se há uma sessão ativa.
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Obtém o usuário atual e seus metadados (tipo, empresa_id).
 * Esta é a única fonte de verdade para a sessão agora.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerSideClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    // Buscamos dados adicionais do banco para garantir consistência
    let userType: "admin" | "empresa" | null = null
    let isSuperAdmin = false
    let empresaId = null

    // Buscamos primeiro na tabela de admins
    const { data: admin } = await supabase.from("admins").select("id, cargo, ativo").eq("id", user.id).single()
    if (admin) {
      if (!admin.ativo) return null // Usuário admin inativo
      userType = "admin"
      isSuperAdmin = admin.cargo?.trim().toLowerCase() === "administrador geral"
    } else {
      // Se não for admin, buscamos na tabela de perfis de empresa
      const { data: perfil } = await supabase.from("perfis_empresas").select("empresa_id").eq("id", user.id).single()
      if (perfil) {
        userType = "empresa"
        empresaId = perfil.empresa_id
      }
    }

    // Se não encontrou em nenhuma tabela, o usuário não é válido no sistema atual
    if (!userType) return null

    // Sincronização de Metadados: Se os metadados do Auth estiverem desatualizados, 
    // atualizamos para garantir que o Middleware e outros componentes vejam o tipo correto.
    if (user.user_metadata?.tipo !== userType || user.user_metadata?.isSuperAdmin !== isSuperAdmin) {
      await supabase.auth.updateUser({
        data: { tipo: userType, isSuperAdmin }
      })
    }

    return {
      id: user.id,
      email: user.email!,
      tipo: userType,
      isSuperAdmin,
      empresa_id: empresaId,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    } as User
  } catch {
    return null
  }
}

/**
 * Verifica se o usuário logado é um administrador ativo.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.tipo === "admin"
}

/**
 * Verifica se a empresa vinculada ao usuário está ativa.
 */
export async function isEmpresaAtiva(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  if (user.tipo === "admin") return true
  if (!user.empresa_id) return false

  const supabase = await createServerSideClient()
  const { data: empresa } = await supabase
    .from("empresas")
    .select("status")
    .eq("id", user.empresa_id)
    .single()

  return empresa?.status === "ativo"
}

/**
 * Registra uma nova conta de empresa.
 */
export async function register(
  email: string,
  password: string,
  tipo: "empresa" | "admin",
  nome_contato?: string,
  telefone?: string,
  cargo?: string,
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    const supabase = await createServerSideClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          tipo,
          nome_contato,
          telefone,
          cargo
        }
      }
    })

    if (error) return { success: false, message: error.message }
    if (!data.user) return { success: false, message: "Erro ao criar usuário." }

    return {
      success: true,
      message: "Cadastro realizado! Verifique seu email para confirmar a conta.",
      userId: data.user.id
    }
  } catch (err: any) {
    return { success: false, message: "Ocorreu um erro inesperado." }
  }
}

/**
 * Recuperação de senha.
 */
export async function recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerSideClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/redefinir-senha`
  })
  
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Link de recuperação enviado!" }
}

/**
 * Redefinição de senha com conta logada (via link de recuperação).
 */
export async function resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerSideClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  
  if (error) return { success: false, message: error.message }
  return { success: true, message: "Senha alterada com sucesso!" }
}