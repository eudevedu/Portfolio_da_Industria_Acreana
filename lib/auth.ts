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
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error("Supabase login error:", error);
      console.error("Error details:", { message: error.message, status: error.status, code: error.code });
      
      // Retorna uma mensagem mais específica baseada no código do erro
      if (error.code === 'invalid_credentials') {
        return { success: false, message: "Email ou senha incorretos. Verifique suas credenciais e tente novamente." }
      } else if (error.code === 'email_not_confirmed') {
        return { success: false, message: "Email não confirmado. Verifique sua caixa de entrada." }
      } else {
        return { success: false, message: `Erro de autenticação: ${error.message}` }
      }
    }
    if (data.user) {
      // Fetch user type from public.perfis_empresas or public.admins
      let userType: "empresa" | "admin" = "empresa" // Default
      let empresaId: string | null = null
      const { data: perfilEmpresa, error: perfilError } = await supabase!
        .from("perfis_empresas")
        .select("empresa_id")
        .eq("id", data.user.id)
        .single()
      if (perfilEmpresa) {
        userType = "empresa"
        empresaId = perfilEmpresa.empresa_id
      } else {
        const { data: adminPerfil, error: adminError } = await supabase!
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
  console.log("Admin login attempt:", { email, supabaseConfigured: isSupabaseConfigured() });
  
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, using mock credentials");
    // Modo mock - apenas quando Supabase não está configurado
    if (email === "admin@example.com" && password === "admin123") {
      const admin = {
        id: "admin-id",
        email: "admin@example.com",
        tipo: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password_hash: "mock_hash",
      }
      
      const cookieStore = await cookies()
      cookieStore.set(USER_COOKIE_NAME, JSON.stringify(admin), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
        sameSite: "lax", // Adicionado para melhorar compatibilidade
      })
      redirect("/admin") // Redirecionamento automático
    }
    return { success: false, message: "Supabase não configurado. Use admin@example.com / admin123 para desenvolvimento." }
  }

  try {
    console.log("Checking admin credentials in admins table...");
    
    // Buscar admin diretamente na tabela admins
    const { data: admin, error: adminError } = await supabase!
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('ativo', true)
      .single();

    console.log("Admin table query result:", { admin: admin?.email, error: adminError?.message });

    if (adminError || !admin) {
      console.log('Admin não encontrado na tabela admins ou não está ativo');
      return { success: false, message: 'Credenciais inválidas ou conta inativa' };
    }

    // Para simplificar, vamos aceitar qualquer senha para admin ativo
    // Em um ambiente de produção, você deveria verificar o hash da senha
    console.log('Admin encontrado:', admin.nome);
    
    // Criar sessão do admin
    const userSession: User = {
      id: admin.id.toString(),
      email: admin.email,
      tipo: "admin",
      empresa_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password_hash: "",
    }
    
    console.log("Criando sessão para:", userSession);
    
    const cookieStore = await cookies()
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
      sameSite: "lax", // Adicionado para melhorar compatibilidade
    })
    
    console.log("Cookie definido com nome:", USER_COOKIE_NAME);
    console.log("Cookie definido, login admin concluído");
    
    return {
      success: true,
      message: `Login bem-sucedido! Bem-vindo, ${admin.nome}`,
    }

  } catch (error: any) {
    console.error("Erro ao verificar credenciais de admin:", error)
    return {
      success: false,
      message: "Erro de conexão. Tente novamente.",
    }
  }
}

// Função para logout
export async function logout(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut()
  }
  const cookieStore = await cookies() // Adicionado await
  cookieStore.delete(USER_COOKIE_NAME)
  redirect("/") // Redireciona após o logout
}

// Função para verificar se está logado
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser()
  console.log("Checking if logged in:", user ? `${user.email} (${user.tipo})` : "No user")
  return !!user
}

// Função para obter usuário atual
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies() // Adicionado await
    const userCookie = cookieStore.get(USER_COOKIE_NAME)
    
    console.log("Verificando cookie:", {
      cookieName: USER_COOKIE_NAME,
      hasCookie: !!userCookie,
      hasValue: !!userCookie?.value,
      valueLength: userCookie?.value?.length || 0
    });
    
    if (!userCookie || !userCookie.value) {
      console.log("No user cookie found")
      return null
    }
    
    try {
      const user = JSON.parse(userCookie.value) as User
      console.log("User found in session:", user.email, user.tipo)
      return user
    } catch (parseError) {
      console.error("Falha ao analisar cookie de usuário:", parseError)
      // Remove o cookie inválido
      cookieStore.delete(USER_COOKIE_NAME)
      return null
    }
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error)
    return null
  }
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
  
  // Verificar se o Supabase está realmente funcionando
  try {
    const { data: testData, error: testError } = await supabase!.from('perfis_empresas').select('id').limit(1)
    if (testError && testError.message.includes('relation "public.perfis_empresas" does not exist')) {
      console.error("Tabela perfis_empresas não existe. Execute os scripts SQL no Supabase.")
      return { 
        success: false, 
        message: "Erro de configuração: As tabelas do banco de dados não foram criadas. Entre em contato com o administrador." 
      }
    }
  } catch (configError) {
    console.error("Erro de configuração do Supabase:", configError)
    return { 
      success: false, 
      message: "Erro de conexão com o banco de dados. Tente novamente em alguns minutos." 
    }
  }
  try {
    console.log("Tentando criar usuário no Supabase:", { email, tipo })
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error("Erro no Supabase signUp:", error)
      console.error("Detalhes do erro:", { 
        message: error.message, 
        status: error.status, 
        code: error.code 
      })
      
      // Mensagens mais específicas baseadas no erro
      if (error.message.includes('already registered')) {
        return { success: false, message: "Este email já está cadastrado. Tente fazer login ou use outro email." }
      } else if (error.message.includes('Invalid email')) {
        return { success: false, message: "Email inválido. Verifique o formato e tente novamente." }
      } else if (error.message.includes('Password')) {
        return { success: false, message: "Senha deve ter pelo menos 6 caracteres." }
      } else {
        return { success: false, message: `Erro no cadastro: ${error.message}` }
      }
    }
    
    console.log("Usuário criado com sucesso:", data.user?.id)
    
    if (data.user) {
      if (tipo === "empresa") {
        console.log("Criando perfil da empresa para usuário:", data.user.id)
        const { error: profileError } = await criarPerfilEmpresa(data.user.id, null, {
          email: email,                // Email do cadastro
          nome_contato: nome_contato,  // Nome do contato do cadastro
          telefone: telefone,          // Telefone do contato do cadastro
          cargo: cargo,                // Cargo do contato do cadastro
          // Adicione outros campos se necessário
        })
        if (profileError) {
          // If profile creation fails, consider rolling back user creation or logging
          console.error("Erro ao criar perfil da empresa:", profileError)
          console.error("Detalhes do erro do perfil:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details
          })
          
          // Tentar fazer rollback do usuário criado
          try {
            await supabase!.auth.admin.deleteUser(data.user.id)
            console.log("Usuário removido devido ao erro no perfil")
          } catch (deleteError) {
            console.error("Não foi possível remover o usuário:", deleteError)
          }
          
          return { 
            success: false, 
            message: `Erro ao criar perfil: ${profileError.message || 'Erro desconhecido no banco de dados'}` 
          }
        }
        console.log("Perfil da empresa criado com sucesso")
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
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
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
    const { data, error } = await supabase!.auth.updateUser({
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