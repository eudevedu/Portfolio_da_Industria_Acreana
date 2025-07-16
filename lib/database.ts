import { supabase, isSupabaseConfigured } from "./supabase"
import type { Empresa, Produto, Arquivo, PerfilEmpresa } from "./supabase.types" // Import PerfilEmpresa

// Funções de busca para Empresas
export async function buscarEmpresas(filters?: {
  status?: string
  setor_economico?: string
  municipio?: string
  busca?: string
}): Promise<Empresa[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "1",
        nome_fantasia: "AcreFoods Indústria",
        razao_social: "Acre Alimentos Ltda.",
        cnpj: "00.000.000/0001-01",
        setor_economico: "agroindustria",
        setor_empresa: "alimentos",
        segmento: "processamento",
        tema_segmento: "alimentos regionais",
        municipio: "Rio Branco",
        endereco: "Rua das Palmeiras, 123, Centro",
        apresentacao: "Líder na produção de alimentos orgânicos da Amazônia.",
        descricao_produtos: "Produzimos polpas de frutas, castanhas e açaí.",
        instagram: "@acrefoods",
        facebook: "facebook.com/acrefoods",
        youtube: "youtube.com/acrefoods",
        linkedin: "linkedin.com/company/acrefoods",
        twitter: "@acrefoods",
        video_apresentacao: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        status: "ativo",
        created_at: "2023-01-15T10:00:00Z",
        updated_at: "2023-01-15T10:00:00Z",
        produtos: [
          {
            id: "prod1",
            empresa_id: "1",
            nome: "Polpa de Açaí Orgânica",
            nome_tecnico: "Euterpe oleracea",
            linha: "Polpas de Frutas",
            descricao: "Polpa de açaí 100% orgânica, sem conservantes.",
            status: "ativo",
            created_at: "2023-01-15T10:00:00Z",
            updated_at: "2023-01-15T10:00:00Z",
          },
        ],
        arquivos: [
          {
            id: "arq1",
            empresa_id: "1",
            nome: "Folder Institucional.pdf",
            url: "/placeholder.pdf",
            tipo: "pdf",
            categoria: "institucional",
            created_at: "2023-01-15T10:00:00Z",
          },
        ],
      },
      {
        id: "2",
        nome_fantasia: "Madeira Nobre do Acre",
        razao_social: "M.N. Acre Madeireira S.A.",
        cnpj: "00.000.000/0001-02",
        setor_economico: "industria",
        setor_empresa: "madeira",
        segmento: "beneficiamento",
        tema_segmento: "madeira sustentável",
        municipio: "Cruzeiro do Sul",
        endereco: "Av. Floresta, 456, Bairro Verde",
        apresentacao: "Especializada em beneficiamento de madeira certificada.",
        descricao_produtos: "Tábuas, vigas e pisos de madeira de lei.",
        instagram: "@madeiranobreac",
        facebook: "",
        youtube: "",
        linkedin: "",
        twitter: "",
        video_apresentacao: "",
        status: "ativo",
        created_at: "2023-02-20T11:00:00Z",
        updated_at: "2023-02-20T11:00:00Z",
        produtos: [],
        arquivos: [],
      },
      {
        id: "3",
        nome_fantasia: "Cerâmica Acreana",
        razao_social: "C.A. Construções Ltda.",
        cnpj: "00.000.000/0001-03",
        setor_economico: "industria",
        setor_empresa: "construcao",
        segmento: "materiais",
        tema_segmento: "construção civil",
        municipio: "Sena Madureira",
        endereco: "Rodovia BR-364, Km 10",
        apresentacao: "Fabricante de telhas e tijolos ecológicos.",
        descricao_produtos: "Telhas coloniais, tijolos de solo-cimento.",
        instagram: "@ceramicaacreana",
        facebook: "",
        youtube: "",
        linkedin: "",
        twitter: "",
        video_apresentacao: "",
        status: "pendente",
        created_at: "2023-03-10T12:00:00Z",
        updated_at: "2023-03-10T12:00:00Z",
        produtos: [],
        arquivos: [],
      },
    ].filter((empresa) => {
      let match = true
      if (filters?.status && filters.status !== "all" && empresa.status !== filters.status) {
        match = false
      }
      if (
        filters?.setor_economico &&
        filters.setor_economico !== "all" &&
        empresa.setor_economico !== filters.setor_economico
      ) {
        match = false
      }
      if (filters?.municipio && filters.municipio !== "all" && empresa.municipio !== filters.municipio) {
        match = false
      }
      if (filters?.busca) {
        const searchLower = filters.busca.toLowerCase()
        if (
          !(
            empresa.nome_fantasia.toLowerCase().includes(searchLower) ||
            empresa.razao_social.toLowerCase().includes(searchLower) ||
            empresa.cnpj.includes(searchLower) ||
            empresa.descricao_produtos?.toLowerCase().includes(searchLower) ||
            empresa.apresentacao?.toLowerCase().includes(searchLower)
          )
        ) {
          match = false
        }
      }
      return match
    })
  }

  let query = supabase.from("empresas").select("*, produtos(*), arquivos(*)")

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
      `nome_fantasia.ilike.%${filters.busca}%,razao_social.ilike.%${filters.busca}%,cnpj.ilike.%${filters.busca}%,descricao_produtos.ilike.%${filters.busca}%,apresentacao.ilike.%${filters.busca}%`,
    )
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return []
  }
  return data as Empresa[]
}

export async function buscarEmpresaPorId(id: string): Promise<Empresa | null> {
  if (!isSupabaseConfigured()) {
    const mockEmpresas = await buscarEmpresas() // Use the mock data from buscarEmpresas
    return mockEmpresas.find((emp) => emp.id === id) || null
  }

  const { data, error } = await supabase.from("empresas").select("*, produtos(*), arquivos(*)").eq("id", id).single()

  if (error) {
    return null
  }
  return data as Empresa
}

export async function criarEmpresa(
  empresa: Omit<Empresa, "id" | "created_at" | "updated_at" | "status">,
): Promise<Empresa | null> {
  if (!isSupabaseConfigured()) {
    // Simulate creation for mock mode
    const newId = `mock-empresa-${Date.now()}`
    return {
      ...empresa,
      id: newId,
      status: "pendente",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Empresa
  }
  const { data, error } = await supabase.from("empresas").insert([empresa]).select().single()
  if (error) {
    return null
  }
  return data as Empresa
}

export async function atualizarEmpresa(id: string, updates: Partial<Empresa>): Promise<Empresa | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado. Simulando atualização de empresa.")
    // Em modo mock, simula a atualização
    return {
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    } as Empresa
  }

  try {
    const { data, error } = await supabase
      .from("empresas")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, produtos(*), arquivos(*)")
      .single()

    if (error) {
      console.error("Erro ao atualizar empresa:", error)
      throw new Error(error.message || "Erro ao atualizar empresa")
    }

    return data as Empresa
  } catch (err) {
    console.error("Erro na função atualizarEmpresa:", err)
    throw err
  }
}

export async function deletarEmpresa(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }
  const { error } = await supabase.from("empresas").delete().eq("id", id)
  if (error) {
    // Erro na deleção, mas a função retorna void, então não há retorno de dados.
    // O erro pode ser tratado no nível do chamador se necessário.
  }
}

// Funções de busca para Produtos
export async function buscarProdutosPorEmpresa(empresaId: string): Promise<Produto[]> {
  if (!isSupabaseConfigured()) {
    const mockEmpresas = await buscarEmpresas()
    const empresa = mockEmpresas.find((e) => e.id === empresaId)
    return empresa?.produtos || []
  }
  const { data, error } = await supabase.from("produtos").select("*").eq("empresa_id", empresaId)
  if (error) {
    return []
  }
  return data as Produto[]
}

export async function criarProduto(
  produto: Omit<Produto, "id" | "created_at" | "updated_at">,
): Promise<Produto | null> {
  if (!isSupabaseConfigured()) {
    return null
  }
  const { data, error } = await supabase.from("produtos").insert([produto]).select().single()
  if (error) {
    return null
  }
  return data as Produto
}

export async function atualizarProduto(id: string, updates: Partial<Produto>): Promise<Produto | null> {
  if (!isSupabaseConfigured()) {
    return null
  }
  const { data, error } = await supabase
    .from("produtos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) {
    return null
  }
  return data as Produto
}

export async function deletarProduto(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }
  const { error } = await supabase.from("produtos").delete().eq("id", id)
  if (error) {
    // Erro na deleção, mas a função retorna void, então não há retorno de dados.
  }
}

// Funções de busca para Analytics
export async function obterAnalytics(empresaId: string): Promise<{
  totalVisualizacoes: number
  visualizacoesMes: number
  produtosMaisVistos: { nome: string; views: number }[]
}> {
  if (!isSupabaseConfigured()) {
    return {
      totalVisualizacoes: 1234,
      visualizacoesMes: 234,
      produtosMaisVistos: [
        { nome: "Açaí Premium", views: 456 },
        { nome: "Polpa de Cupuaçu", views: 234 },
        { nome: "Castanha do Pará", views: 123 },
      ],
    }
  }

  let totalVisualizacoes = 0
  let visualizacoesMes = 0
  // Produtos mais vistos ainda são mockados, pois a lógica para buscá-los do DB não foi implementada
  const produtosMaisVistos = [
    { nome: "Açaí Premium", views: 456 },
    { nome: "Polpa de Cupuaçu", views: 234 },
    { nome: "Castanha do Pará", views: 123 },
  ]

  const { data: totalViewsData, error: totalViewsError } = await supabase
    .from("analytics")
    .select("id", { count: "exact" })
    .eq("empresa_id", empresaId)
    .eq("tipo_evento", "visualizacao_perfil")

  if (!totalViewsError) {
    totalVisualizacoes = totalViewsData?.length || 0
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthViewsData, error: monthViewsError } = await supabase
    .from("analytics")
    .select("id", { count: "exact" })
    .eq("empresa_id", empresaId)
    .eq("tipo_evento", "visualizacao_perfil")
    .gte("timestamp", startOfMonth.toISOString())

  if (!monthViewsError) {
    visualizacoesMes = monthViewsData?.length || 0
  }

  // Se houver qualquer erro na busca do Supabase, retorne valores padrão/zero
  if (totalViewsError || monthViewsError) {
    return {
      totalVisualizacoes: 0,
      visualizacoesMes: 0,
      produtosMaisVistos: [], // Retorna array vazio em caso de erro
    }
  }

  return {
    totalVisualizacoes,
    visualizacoesMes,
    produtosMaisVistos,
  }
}

// Funções para Arquivos
export async function criarArquivo(arquivo: Omit<Arquivo, "id" | "created_at">): Promise<Arquivo | null> {
  if (!isSupabaseConfigured()) {
    return null
  }
  const { data, error } = await supabase.from("arquivos").insert([arquivo]).select().single()
  if (error) {
    return null
  }
  return data as Arquivo
}

export async function buscarArquivosPorEmpresa(empresaId: string): Promise<Arquivo[]> {
  if (!isSupabaseConfigured()) {
    const mockEmpresas = await buscarEmpresas()
    const empresa = mockEmpresas.find((e) => e.id === empresaId)
    return empresa?.arquivos || []
  }
  const { data, error } = await supabase.from("arquivos").select("*").eq("empresa_id", empresaId)
  if (error) {
    return []
  }
  return data as Arquivo[]
}

// Novas funções para gerenciar perfis de empresa (vinculados a auth.users)
export async function criarPerfilEmpresa(
  userId: string,
  empresaId: string | null, // Pode ser null inicialmente, vinculado depois
  profileData: Partial<PerfilEmpresa>,
): Promise<{ data: PerfilEmpresa | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("Supabase not configured") }
  }
  const { data, error } = await supabase
    .from("perfis_empresas")
    .insert([{ id: userId, empresa_id: empresaId, ...profileData }])
    .select()
    .single()
  if (error) {
    return { data: null, error }
  }
  return { data: data as PerfilEmpresa, error: null }
}

export async function vincularEmpresaAoPerfil(
  userId: string,
  empresaId: string,
): Promise<{ success: boolean; error: any }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: new Error("Supabase not configured") }
  }
  const { error } = await supabase
    .from("perfis_empresas")
    .update({ empresa_id: empresaId, updated_at: new Date().toISOString() })
    .eq("id", userId)
  if (error) {
    return { success: false, error }
  }
  return { success: true, error: null }
}
