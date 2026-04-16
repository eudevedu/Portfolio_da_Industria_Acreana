"use server"

import { redirect } from "next/navigation"
import { createServerSideClient } from "./supabase"
import { getAuthenticatedUser } from "./auth-guards"
import type { User } from "./supabase.types"

/**
 * Login consolidado usando Supabase Auth
 */
export async function login(email: string, password: string): Promise<{ success: boolean; message: string; tipo?: string }> {
  try {
    const supabase = await createServerSideClient()
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password })

    if (error) {
      return { success: false, message: "Email ou senha incorretos." }
    }

    // O tipo já deve vir no metadata do usuário se o cadastro foi feito corretamente
    const userTipo = data.user.user_metadata?.tipo

    if (userTipo === "admin") {
      return { success: true, message: "Login bem-sucedido!", tipo: "admin" }
    }

    // Se for empresa ou visitante, busca perfil para confirmar empresa_id
    const { data: perfil } = await supabase!.from("perfis_empresas").select("empresa_id").eq("id", data.user.id).single()
    return { success: true, message: "Login bem-sucedido!", tipo: perfil ? "empresa" : "visitante" }

  } catch (error) {
    return { success: false, message: "Erro inesperado durante o login." }
  }
}

/**
 * Logout seguro removendo a sessão do Supabase
 */
export async function logout(): Promise<void> {
  const supabase = await createServerSideClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect("/")
}

/**
 * Obtém o usuário atual com tipagem e papel corretos
 */
export async function getCurrentUser(): Promise<User | null> {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const supabase = await createServerSideClient()
  const tipo = user.user_metadata?.tipo || "visitante"
  let empresaId = null

  if (tipo === "empresa") {
    const { data: perfil } = await supabase.from("perfis_empresas").select("empresa_id").eq("id", user.id).single()
    empresaId = perfil?.empresa_id
  }

  return {
    id: user.id,
    email: user.email!,
    tipo: tipo as any,
    empresa_id: empresaId,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
  } as User
}

/**
 * Registro de novos usuários com definição de papel via Metadata
 */
export async function register(
  email: string,
  password: string,
  tipo: "empresa" | "admin",
  nome_contato: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerSideClient()
  
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: {
      data: { tipo, nome_contato } 
    }
  })

  if (error) return { success: false, message: error.message }

  if (data.user && tipo === "empresa") {
    await supabase!.from("perfis_empresas").insert({
      id: data.user.id,
      nome_contato,
    })
  }

  return { success: true, message: "Registro bem-sucedido! Verifique seu email." }
}

/**
 * Helpers de Compatibilidade Legada
 */
export async function isLoggedIn() {
  const user = await getAuthenticatedUser()
  return !!user
}

export async function isAdmin() {
  const user = await getAuthenticatedUser()
  return user?.user_metadata?.tipo === "admin"
}

export async function isEmpresaAtiva() {
  const user = await getCurrentUser()
  if (!user || user.tipo !== "empresa") return false
  if (!user.empresa_id) return false

  const supabase = await createServerSideClient()
  const { data: empresa } = await supabase.from("empresas").select("status").eq("id", user.empresa_id).single()
  return empresa?.status === "ativo"
}