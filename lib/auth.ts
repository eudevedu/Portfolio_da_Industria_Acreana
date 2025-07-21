"use server" // Todas as funções exportadas deste arquivo são Server Actions
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabase, isSupabaseConfigured } from "./supabase"
import type { User } from "./supabase.types" // Importa o tipo User do novo arquivo de tipos
import { criarPerfilEmpresa } from "./database" // Importa a nova função (corrigido para 'data' se for o arquivo correto)

const USER_COOKIE_NAME = "user_session"

// Tipos para autenticação
export interface LoginResult {
  success: boolean
  message: string
}

// Função para login de empresas
export async function login(email: string, password: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    // Lógica de login mock
    let user: User | null = null
    if (email === "admin@example.com" && password === "admin123") {
      user = {
        id: "admin-id",
        email: "admin@example.com",
        tipo: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password_hash: "mock_hash", // Adicionado para tipo User
      }
    } else if (email === "empresa@example.com" && password === "empresa123") {
      user = {
        id: "empresa-id",
        email: "empresa@example.com",
        tipo: "empresa",
        empresa_id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password_hash: "mock_hash", // Adicionado para tipo User
      }
    }
    if (user) {
      const cookieStore = await cookies() // Adicionado await
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      })
      return { success: true, message: "Login bem-sucedido!" }
    } else {
      return { success: false, message: "Credenciais inválidas." }
    }
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error("Supabase error:", error, error.message);
      return { success: false, message: error.message }
    }
    if (data.user) {
      // Fetch user type from public.perfis_empresas or public.admins
      let userType: "empresa" | "admin" = "empresa" // Default
      let empresaId: string | null = null
      const { data: perfilEmpresa, error: perfilError } = await supabase
        .from("perfis_empresas")
        .select("empresa_id")
        .eq("id", data.user.id)
        .single()
      if (perfilEmpresa) {
        userType = "empresa"
        empresaId = perfilEmpresa.empresa_id
      } else {
        const { data: adminPerfil, error: adminError } = await supabase
          .from("admins")
          .select("id")
          .eq("id", data.user.id)
          .single()
        if (adminPerfil) {
          userType = "admin"
        }
      }
      const userSession: User = {
        id: data.user.id,
        email: data.user.email!,
        tipo: userType,
        empresa_id: empresaId,
        created_at: data.user.created_at ?? "",
        updated_at: data.user.updated_at ?? "",
        password_hash: "", // ou "hidden"
      }
      const cookieStore = await cookies() // Adicionado await
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify(userSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      })
      return { success: true, message: "Login bem-sucedido!" }
    }
    return { success: false, message: "Erro desconhecido durante o login." }
  } catch (error: any) {
    console.error("Erro ao conectar com o servidor:", error)
    return { success: false, message: error.message || "Ocorreu um erro inesperado durante o login." }
  }
}

// Função para login de administradores
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    // Modo mock
    const admin = {
      id: "admin-id",
      email: "admin@example.com",
      tipo: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password_hash: "mock_hash",
    }
    if (email === admin.email && password === "admin123") {
      const cookieStore = await cookies() // Adicionado await
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify(admin), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      })
      return { success: true, message: "Login bem-sucedido!" }
    } else {
      return { success: false, message: "Credenciais inválidas." }
    }
  }
  try {
    // Login admin com Supabase (usando uma tabela separada de admins)
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error("Supabase error:", error, error.message);
      return {
        success: false,
        message: error.message,
      }
    }
    if (data.user) {
      // Verificar se é admin na tabela de admins
      const { data: adminData, error: adminError } = await supabase!
        .from("admins")
        .select("id, nome")
        .eq("id", data.user.id) // Check by user ID from auth.users
        .single()
      if (adminError || !adminData) {
        // If user exists in auth.users but not in admins table, deny access
        await supabase.auth.signOut() // Sign out the user from auth.users
        return {
          success: false,
          message: "Acesso não autorizado. Esta conta não é de administrador.",
        }
      }
      const userSession: User = {
        id: data.user.id,
        email: data.user.email!,
        tipo: "admin",
        empresa_id: null,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at ?? "",
        password_hash: "", // Adicione esta linha
      }
      const cookieStore = await cookies() // Adicionado await
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify(userSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      })
      return {
        success: true,
        message: "Login bem-sucedido!",
      }
    }
    return {
      success: false,
      message: "Erro desconhecido",
    }
  } catch (error: any) {
    console.error("Erro ao conectar com o servidor:", error)
    return {
      success: false,
      message: error.message || "Ocorreu um erro inesperado durante o login do administrador.",
    }
  }
}

// Função para logout
export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut()
  }
  const cookieStore = await cookies() // Adicionado await
  cookieStore.delete(USER_COOKIE_NAME)
  redirect("/") // Redireciona após o logout
}

// Função para verificar se está logado
export async function isLoggedIn(): Promise<boolean> {
  return !!(await getCurrentUser())
}

// Função para obter usuário atual
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies() // Adicionado await
  const userCookie = cookieStore.get(USER_COOKIE_NAME)
  if (userCookie && userCookie.value) {
    try {
      return JSON.parse(userCookie.value) as User
    } catch (e) {
      console.error("Falha ao analisar cookie de usuário:", e)
      return null
    }
  }
  return null
}

// Função para verificar se é admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.tipo === "admin"
}

// Função para registro (agora com Supabase Auth e criação de perfil)
export async function register(
  email: string,
  password: string,
  tipo: "empresa" | "admin",
  nome_contato?: string,
  telefone?: string,
  cargo?: string,
): Promise<{ success: boolean; message: string; userId?: string }> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Registro mock.")
    // Simulate creation for mock mode
    return { success: true, message: "Registro bem-sucedido! Faça login para continuar.", userId: "mock-user-id" }
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.error("Supabase error:", error, error.message);
      return { success: false, message: error.message }
    }
    if (data.user) {
      if (tipo === "empresa") {
        const { error: profileError } = await criarPerfilEmpresa(data.user.id, null, {
          email: email,                // Email do cadastro
          nome_completo: nome_contato, // Nome do contato do cadastro
          telefone: telefone,          // Telefone do contato do cadastro
          cargo: cargo,                // Cargo do contato do cadastro
          // Adicione outros campos se necessário
        })
        if (profileError) {
          // If profile creation fails, consider rolling back user creation or logging
          console.error("Erro ao criar perfil da empresa:", profileError)
          // Optionally, delete the user from auth.users if profile creation is critical
          // await supabase.auth.admin.deleteUser(data.user.id);
          return { success: false, message: "Registro de usuário bem-sucedido, mas falha ao criar perfil da empresa." }
        }
      }
      return {
        success: true,
        message: "Registro bem-sucedido! Verifique seu email para confirmar.",
        userId: data.user.id,
      }
    }
    return { success: false, message: "Erro desconhecido durante o registro." }
  } catch (err: any) {
    console.error("Erro ao registrar usuário:", err)
    return { success: false, message: err.message || "Ocorreu um erro inesperado durante o registro." }
  }
}

// Função para recuperação de senha
export async function recoverPassword(email: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Recuperação de senha mock.")
    return { success: true, message: "Se as credenciais estiverem corretas, um link de recuperação foi enviado." }
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/redefinir-senha`, // Replace with your actual reset password page URL
    })
    if (error) {
      return { success: false, message: error.message }
    }
    return { success: true, message: "Um link de redefinição de senha foi enviado para o seu email." }
  } catch (err: any) {
    console.error("Erro na recuperação de senha:", err)
    return { success: false, message: err.message || "Ocorreu um erro inesperado durante a recuperação de senha." }
  }
}

// Nova função para redefinir a senha
export async function resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Redefinição de senha mock.")
    return { success: true, message: "Senha redefinida com sucesso (modo mock)!" }
  }
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      return { success: false, message: error.message }
    }
    if (data.user) {
      return { success: true, message: "Sua senha foi redefinida com sucesso! Você pode fazer login agora." }
    }
    return { success: false, message: "Erro desconhecido ao redefinir a senha." }
  } catch (err: any) {
    console.error("Erro ao redefinir senha:", err)
    return { success: false, message: err.message || "Ocorreu um erro inesperado ao redefinir a senha." }
  }
}
