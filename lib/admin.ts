import { supabase, supabaseAdmin, isSupabaseConfigured, isSupabaseAdminConfigured } from "./supabase"
import type { Empresa, Admin } from "./supabase.types"

export async function obterEstatisticasAdmin(): Promise<{
  totalEmpresas: number
  empresasAtivas: number
  empresasPendentes: number
  empresasInativas: number
  novosCadastrosMes: number
  totalProdutos: number
  visualizacoesTotais: number
}> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Retornando estatísticas mock para admin.")
    return {
      totalEmpresas: 150,
      empresasAtivas: 100,
      empresasPendentes: 30,
      empresasInativas: 20,
      novosCadastrosMes: 15,
      totalProdutos: 500,
      visualizacoesTotais: 10000,
    }
  }

  const { count: totalEmpresas, error: err1 } = await supabase!
    .from("empresas")
    .select("id", { count: "exact", head: true })
  const { count: empresasAtivas, error: err2 } = await supabase!
    .from("empresas")
    .select("id", { count: "exact", head: true })
    .eq("status", "ativo")
  const { count: empresasPendentes, error: err3 } = await supabase!
    .from("empresas")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendente")
  const { count: empresasInativas, error: err4 } = await supabase!
    .from("empresas")
    .select("id", { count: "exact", head: true })
    .eq("status", "inativo")

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const { count: novosCadastrosMes, error: err5 } = await supabase!
    .from("empresas")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  const { count: totalProdutos, error: err6 } = await supabase!
    .from("produtos")
    .select("id", { count: "exact", head: true })

  const { count: visualizacoesTotais, error: err7 } = await supabase!
    .from("analytics")
    .select("id", { count: "exact", head: true })
    .eq("tipo_evento", "visualizacao_perfil")

  if (err1 || err2 || err3 || err4 || err5 || err6 || err7) {
    console.error("Erro ao obter estatísticas do admin:", err1 || err2 || err3 || err4 || err5 || err6 || err7)
    return {
      totalEmpresas: 0,
      empresasAtivas: 0,
      empresasPendentes: 0,
      empresasInativas: 0,
      novosCadastrosMes: 0,
      totalProdutos: 0,
      visualizacoesTotais: 0,
    }
  }

  return {
    totalEmpresas: totalEmpresas || 0,
    empresasAtivas: empresasAtivas || 0,
    empresasPendentes: empresasPendentes || 0,
    empresasInativas: empresasInativas || 0,
    novosCadastrosMes: novosCadastrosMes || 0,
    totalProdutos: totalProdutos || 0,
    visualizacoesTotais: visualizacoesTotais || 0,
  }
}

export async function buscarEmpresasAdmin(filters?: {
  status?: string
  setor_economico?: string
  municipio?: string
  busca?: string
}): Promise<Empresa[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Retornando dados mock para empresas admin.")
    // Reutiliza a lógica de mock de buscarEmpresas para consistência
    const mockEmpresas = await (await import("./database")).buscarEmpresas(filters)
    return mockEmpresas
  }

  let query = supabase!.from("empresas").select("*")

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
      `nome_fantasia.ilike.%${filters.busca}%,razao_social.ilike.%${filters.busca}%,cnpj.ilike.%${filters.busca}%`,
    )
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar empresas para admin:", error)
    return []
  }
  return data as Empresa[]
}

export async function atualizarStatusEmpresa(
  id: string,
  newStatus: "ativo" | "pendente" | "inativo",
): Promise<Empresa | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Não é possível atualizar status da empresa mock.")
    return null
  }
  const { data, error } = await supabase!
    .from("empresas")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) {
    console.error(`Erro ao atualizar status da empresa ${id}:`, error)
    return null
  }
  return data as Empresa
}

// Funções para gerenciar administradores
export async function criarAdmin(dadosAdmin: {
  nome: string
  email: string
  password: string
  cargo?: string
}): Promise<Admin | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Não é possível criar administrador.")
    return null
  }

  if (!isSupabaseAdminConfigured()) {
    console.error("Supabase Admin (SERVICE_ROLE_KEY) não configurado. Não é possível criar administrador.")
    throw new Error("Configuração administrativa não encontrada. Verifique SUPABASE_SERVICE_ROLE_KEY.")
  }

  try {
    console.log("Iniciando criação de admin:", { nome: dadosAdmin.nome, email: dadosAdmin.email })

    // 1. Criar usuário no sistema de autenticação do Supabase
    const { data: authUser, error: authError } = await supabaseAdmin!.auth.admin.createUser({
      email: dadosAdmin.email,
      password: dadosAdmin.password,
      email_confirm: true,
      user_metadata: {
        tipo: 'admin',
        nome: dadosAdmin.nome
      }
    })

    if (authError) {
      console.error("Erro ao criar usuário de autenticação:", authError)
      throw new Error(`Erro na autenticação: ${authError.message}`)
    }

    console.log("Usuário de auth criado com sucesso:", authUser.user.id)

    // 2. Criar registro na tabela admins (sem password_hash)
    const { data, error } = await supabase!
      .from("admins")
      .insert({
        id: authUser.user.id, // Usar o mesmo ID do auth
        nome: dadosAdmin.nome,
        email: dadosAdmin.email,
        cargo: dadosAdmin.cargo,
        ativo: true
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar registro de administrador:", error)
      
      // Se falhar ao criar o registro do admin, remover o usuário de auth
      await supabaseAdmin!.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Erro ao salvar admin: ${error.message}`)
    }

    console.log("Administrador criado com sucesso:", data)
    return data as Admin

  } catch (error) {
    console.error("Erro geral ao criar administrador:", error)
    throw error
  }
}

export async function obterTodosAdmins(): Promise<Admin[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Retornando lista mock de administradores.")
    return [
      {
        id: "1",
        nome: "Admin Principal",
        email: "admin@exemplo.com",
        cargo: "Administrador Geral",
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "2", 
        nome: "Admin Secundário",
        email: "admin2@exemplo.com",
        cargo: "Moderador",
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  const { data, error } = await supabase!
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar administradores:", error)
    return []
  }

  return data as Admin[]
}

export async function atualizarStatusAdmin(
  id: string,
  ativo: boolean
): Promise<Admin | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Não é possível atualizar status do administrador.")
    return null
  }

  const { data, error } = await supabase!
    .from("admins")
    .update({ 
      ativo: ativo,
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Erro ao atualizar status do administrador ${id}:`, error)
    return null
  }

  return data as Admin
}
