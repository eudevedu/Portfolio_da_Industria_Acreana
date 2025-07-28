import { supabase, isSupabaseConfigured } from "./supabase"
import type { Empresa, Produto, Arquivo, PerfilEmpresa } from "./supabase.types"

let mockEmpresasStore: Empresa[] | null = null

// Funções de busca para Empresas
export async function buscarEmpresas(filters?: {
  status?: string
  setor_economico?: string
  municipio?: string
  busca?: string
}): Promise<Empresa[]> {
  if (!isSupabaseConfigured()) {
    if (!mockEmpresasStore) {
      mockEmpresasStore = [
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
          logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop&crop=center",
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
      ]
    }
    // Aplicar filtros nos dados mock
    return mockEmpresasStore.filter((empresa) => {
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
  let query = supabase!.from("empresas").select("*, produtos(*), arquivos(*)")
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
    const mockEmpresas = await buscarEmpresas()
    return mockEmpresas.find((emp) => emp.id === id) || null
  }
  const { data, error } = await supabase!
    .from("empresas")
    .select(`
      *,
      produtos(*),
      arquivos(*)
    `)
    .eq("id", id)
    .single()
  if (error) {
    console.error("Erro ao buscar empresa por ID:", error)
    return null
  }
  return data as Empresa
}

export async function criarEmpresa(
  empresa: Omit<Empresa, "id" | "created_at" | "updated_at" | "status" | "produtos" | "arquivos" | "perfil_empresa">,
): Promise<Empresa | null> {
  if (!isSupabaseConfigured()) {
    const newId = `mock-empresa-${Date.now()}`
    const novaEmpresa = {
      ...empresa,
      id: newId,
      status: "pendente",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      produtos: [],
      arquivos: [],
    } as Empresa
    if (!mockEmpresasStore) await buscarEmpresas()
    mockEmpresasStore!.push(novaEmpresa)
    return novaEmpresa
  }
  
  console.log("Criando empresa no Supabase:", empresa)
  const { data, error } = await supabase!.from("empresas").insert([empresa]).select().single()
  if (error) {
    console.error("Erro ao criar empresa no Supabase:", error)
    throw new Error(`Erro ao criar empresa: ${error.message}`)
  }
  console.log("Empresa criada com sucesso:", data)
  return data as Empresa
}

export async function atualizarEmpresa(id: string, updates: Partial<Empresa>): Promise<Empresa | null> {
  console.log("atualizarEmpresa chamada:", { id, updates })
  
  if (!isSupabaseConfigured()) {
    console.log("Supabase não configurado, usando mock store")
    if (!mockEmpresasStore) await buscarEmpresas()
    const idx = mockEmpresasStore!.findIndex((e) => e.id === id)
    if (idx === -1) return null
    const atualizada = {
      ...mockEmpresasStore![idx],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    mockEmpresasStore![idx] = atualizada
    console.log("Empresa atualizada no mock:", atualizada)
    return atualizada
  }
  
  console.log("Atualizando empresa no Supabase...")
  const { data, error } = await supabase!
    .from("empresas")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
    
  if (error) {
    console.error("Erro ao atualizar empresa no Supabase:", error)
    return null
  }
  
  console.log("Empresa atualizada no Supabase:", data)
  return data as Empresa
}

export async function deletarEmpresa(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }
  const { error } = await supabase!.from("empresas").delete().eq("id", id)
  if (error) {
    // Erro na deleção
  }
}

// Funções de busca para Produtos
export async function buscarProdutosPorEmpresa(empresaId: string): Promise<Produto[]> {
  if (!isSupabaseConfigured()) {
    const mockEmpresas = await buscarEmpresas()
    const empresa = mockEmpresas.find((e) => e.id === empresaId)
    return empresa?.produtos || []
  }
  const { data, error } = await supabase!.from("produtos").select("*").eq("empresa_id", empresaId)
  if (error) {
    return []
  }
  return data as Produto[]
}

export async function criarProduto(
  produto: Omit<Produto, "id" | "created_at" | "updated_at">,
): Promise<Produto | null> {
  if (!isSupabaseConfigured()) {
    // Adiciona produto ao mock
    const newId = `mock-produto-${Date.now()}`
    const novoProduto = {
      ...produto,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "ativo",
    } as Produto
    if (!mockEmpresasStore) await buscarEmpresas()
    const empresa = mockEmpresasStore!.find(e => e.id === produto.empresa_id)
    if (!empresa) return null
    empresa.produtos.push(novoProduto)
    return novoProduto
  }
  const { data, error } = await supabase!.from("produtos").insert([produto]).select().single()
  if (error) {
    return null
  }
  return data as Produto
}

export async function atualizarProduto(id: string, updates: Partial<Produto>): Promise<Produto | null> {
  if (!isSupabaseConfigured()) {
    if (!mockEmpresasStore) await buscarEmpresas()
    for (const empresa of mockEmpresasStore!) {
      const idx = empresa.produtos.findIndex(p => p.id === id)
      if (idx !== -1) {
        const atualizado = {
          ...empresa.produtos[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        empresa.produtos[idx] = atualizado
        return atualizado
      }
    }
    return null
  }
  const { data, error } = await supabase!
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
    if (!mockEmpresasStore) await buscarEmpresas()
    for (const empresa of mockEmpresasStore!) {
      empresa.produtos = empresa.produtos.filter(p => p.id !== id)
    }
    return
  }
  const { error } = await supabase!.from("produtos").delete().eq("id", id)
  if (error) {
    // Erro na deleção
  }
}

// Funções de busca para Analytics
export async function obterAnalytics(empresaId: string): Promise<{
  totalVisualizacoes: number
  visualizacoesMes: number
  produtosMaisVistos: { nome: string; views: number }[]
  produtosDoMes: number
}> {
  if (!isSupabaseConfigured()) {
    // Buscar produtos da empresa no mock store para simular dados realistas
    const mockEmpresas = await buscarEmpresas()
    const empresa = mockEmpresas.find(e => e.id === empresaId)
    const produtosMock = empresa?.produtos || []
    
    const produtosMaisVistos = produtosMock.slice(0, 3).map((produto, index) => ({
      nome: produto.nome,
      views: 500 - (index * 100) // Simula views decrescentes
    }))

    return {
      totalVisualizacoes: 1234,
      visualizacoesMes: 234,
      produtosMaisVistos,
      produtosDoMes: 2, // Simula 2 produtos adicionados este mês
    }
  }

  let totalVisualizacoes = 0
  let visualizacoesMes = 0
  let produtosMaisVistos: { nome: string; views: number }[] = []
  let produtosDoMes = 0

  const { data: totalViewsData, error: totalViewsError } = await supabase!
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

  const { data: monthViewsData, error: monthViewsError } = await supabase!
    .from("analytics")
    .select("id", { count: "exact" })
    .eq("empresa_id", empresaId)
    .eq("tipo_evento", "visualizacao_perfil")
    .gte("timestamp", startOfMonth.toISOString())

  if (!monthViewsError) {
    visualizacoesMes = monthViewsData?.length || 0
  }

  // Buscar produtos criados no mês atual
  try {
    const { data: produtosDoMesData, error: produtosDoMesError } = await supabase!
      .from('produtos')
      .select('id', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .gte('created_at', startOfMonth.toISOString())

    if (!produtosDoMesError) {
      produtosDoMes = produtosDoMesData?.length || 0
    }
  } catch (error) {
    console.error('Erro ao buscar produtos do mês:', error)
  }

  // Buscar produtos mais visualizados da empresa específica
  try {
    const { data: produtosAnalytics, error: produtosError } = await supabase!
      .from('analytics')
      .select('referencia_id')
      .eq('empresa_id', empresaId)
      .eq('tipo_evento', 'visualizacao_produto')
      .not('referencia_id', 'is', null)

    if (!produtosError && produtosAnalytics) {
      // Contar visualizações por produto
      const viewCounts: Record<string, number> = {}
      produtosAnalytics.forEach(item => {
        if (item.referencia_id) {
          viewCounts[item.referencia_id] = (viewCounts[item.referencia_id] || 0) + 1
        }
      })

      // Buscar nomes dos produtos
      const produtoIds = Object.keys(viewCounts)
      if (produtoIds.length > 0) {
        const { data: produtosData, error: produtosNomeError } = await supabase!
          .from('produtos')
          .select('id, nome')
          .eq('empresa_id', empresaId)
          .in('id', produtoIds)

        if (!produtosNomeError && produtosData) {
          produtosMaisVistos = produtosData
            .map(produto => ({
              nome: produto.nome,
              views: viewCounts[produto.id] || 0
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5) // Top 5 produtos
        }
      }
    }
  } catch (error) {
    console.error('Erro ao buscar produtos mais visualizados:', error)
  }

  if (totalViewsError || monthViewsError) {
    return {
      totalVisualizacoes: 0,
      visualizacoesMes: 0,
      produtosMaisVistos: [],
      produtosDoMes: 0,
    }
  }

  return {
    totalVisualizacoes,
    visualizacoesMes,
    produtosMaisVistos,
    produtosDoMes,
  }
}

// Função para buscar produtos mais visualizados globalmente
export async function buscarProdutosMaisVisualizados(limite: number = 6): Promise<Array<{
  id: string
  nome: string
  descricao?: string
  empresa: {
    id: string
    nome_fantasia: string
    logo_url?: string
  }
  visualizacoes: number
}>> {
  if (!isSupabaseConfigured()) {
    // Retorna dados mock quando Supabase não está configurado
    return [
      {
        id: "prod1",
        nome: "Açaí Premium Orgânico",
        descricao: "Açaí 100% orgânico da Amazônia",
        empresa: {
          id: "1",
          nome_fantasia: "AcreFoods Indústria",
          logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop&crop=center"
        },
        visualizacoes: 1250
      },
      {
        id: "prod2",
        nome: "Castanha do Pará Premium",
        descricao: "Castanha do Pará selecionada e embalada a vácuo",
        empresa: {
          id: "1",
          nome_fantasia: "AcreFoods Indústria",
          logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop&crop=center"
        },
        visualizacoes: 980
      },
      {
        id: "prod3",
        nome: "Tábuas de Madeira Nobre",
        descricao: "Tábuas de madeira certificada FSC",
        empresa: {
          id: "2",
          nome_fantasia: "Madeira Nobre do Acre",
          logo_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center"
        },
        visualizacoes: 856
      },
      {
        id: "prod4",
        nome: "Polpa de Cupuaçu",
        descricao: "Polpa natural de cupuaçu sem conservantes",
        empresa: {
          id: "1",
          nome_fantasia: "AcreFoods Indústria",
          logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop&crop=center"
        },
        visualizacoes: 734
      },
      {
        id: "prod5",
        nome: "Telhas Ecológicas",
        descricao: "Telhas coloniais feitas com materiais sustentáveis",
        empresa: {
          id: "3",
          nome_fantasia: "Cerâmica Acreana",
          logo_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center"
        },
        visualizacoes: 692
      },
      {
        id: "prod6",
        nome: "Mel de Abelha Orgânico",
        descricao: "Mel puro de abelhas nativas da Amazônia",
        empresa: {
          id: "1",
          nome_fantasia: "AcreFoods Indústria",
          logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop&crop=center"
        },
        visualizacoes: 567
      }
    ]
  }

  try {
    // Buscar todas as visualizações de produtos
    const { data: analyticsData, error: analyticsError } = await supabase!
      .from('analytics')
      .select('referencia_id')
      .eq('tipo_evento', 'visualizacao_produto')
      .not('referencia_id', 'is', null)

    if (analyticsError) {
      console.error('Erro ao buscar analytics:', analyticsError)
      return []
    }

    // Contar visualizações por produto
    const viewCounts: Record<string, number> = {}
    analyticsData?.forEach(item => {
      if (item.referencia_id) {
        viewCounts[item.referencia_id] = (viewCounts[item.referencia_id] || 0) + 1
      }
    })

    // Ordenar produtos por número de visualizações
    const topProductIds = Object.entries(viewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limite)
      .map(([id]) => id)

    if (topProductIds.length === 0) {
      return []
    }

    // Buscar dados dos produtos mais visualizados
    const { data: produtosData, error: produtosError } = await supabase!
      .from('produtos')
      .select(`
        id,
        nome,
        descricao,
        empresa_id,
        empresas(
          id,
          nome_fantasia,
          logo_url
        )
      `)
      .in('id', topProductIds)

    if (produtosError) {
      console.error('Erro ao buscar produtos:', produtosError)
      return []
    }

    // Transformar os dados no formato esperado e manter a ordem de visualizações
    return topProductIds.map(id => {
      const produto = produtosData?.find(p => p.id === id)
      if (!produto || !produto.empresas) return null

      const empresa = Array.isArray(produto.empresas) ? produto.empresas[0] : produto.empresas

      return {
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao,
        empresa: {
          id: empresa.id,
          nome_fantasia: empresa.nome_fantasia,
          logo_url: empresa.logo_url
        },
        visualizacoes: viewCounts[id]
      }
    }).filter(Boolean) as Array<{
      id: string
      nome: string
      descricao?: string
      empresa: {
        id: string
        nome_fantasia: string
        logo_url?: string
      }
      visualizacoes: number
    }>
  } catch (error) {
    console.error('Erro ao buscar produtos mais visualizados:', error)
    return []
  }
}

// Funções para Arquivos
export async function criarArquivo(arquivo: Omit<Arquivo, "id" | "created_at">): Promise<Arquivo | null> {
  if (!isSupabaseConfigured()) {
    return null
  }
  const { data, error } = await supabase!.from("arquivos").insert([arquivo]).select().single()
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
  const { data, error } = await supabase!.from("arquivos").select("*").eq("empresa_id", empresaId)
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
  
  console.log("Criando/atualizando perfil da empresa:", { userId, empresaId, profileData })
  
  // Garantir que campos obrigatórios estejam preenchidos
  const perfilCompleto = {
    id: userId,
    empresa_id: empresaId,
    nome_contato: profileData.nome_contato || '',
    email: profileData.email || '',
    telefone: profileData.telefone || null,
    cargo: profileData.cargo || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...profileData, // Sobrescreve com dados fornecidos
  }
  
  // Usar UPSERT para evitar erro de chave duplicada
  const { data, error } = await supabase!
    .from("perfis_empresas")
    .upsert([perfilCompleto])
    .select()
    .single()
    
  if (error) {
    console.error("Erro ao criar/atualizar perfil da empresa:", error)
    return { data: null, error }
  }
  
  console.log("Perfil da empresa criado/atualizado com sucesso:", data)
  return { data: data as PerfilEmpresa, error: null }
}

export async function vincularEmpresaAoPerfil(
  userId: string,
  empresaId: string,
): Promise<{ success: boolean; error: any }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: new Error("Supabase not configured") }
  }
  const { error } = await supabase!
    .from("perfis_empresas")
    .update({ empresa_id: empresaId, updated_at: new Date().toISOString() })
    .eq("id", userId)
  if (error) {
    return { success: false, error }
  }
  return { success: true, error: null }
}

export async function buscarPerfilEmpresaPorId(userId: string): Promise<PerfilEmpresa | null> {
  if (!isSupabaseConfigured()) {
    // Simular busca para modo mock
    // Retorna um perfil mock se o userId for "mock-user-1" para demonstração
    if (userId === "mock-user-1") {
      return {
        id: "mock-user-1",
        empresa_id: "1", // Vinculado à AcreFoods Indústria
        nome_contato: "Usuário Mock",
        email: "mock@example.com",
        telefone: "999999999",
        cargo: "Gerente",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as PerfilEmpresa
    }
    return null
  }
  const { data, error } = await supabase!.from("perfis_empresas").select("*").eq("id", userId).single()
  if (error) {
    console.error("Erro ao buscar perfil da empresa:", error)
    return null
  }
  return data as PerfilEmpresa
}

export async function atualizarPerfilEmpresa(
  userId: string,
  updates: Partial<PerfilEmpresa>,
): Promise<{ data: PerfilEmpresa | null; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("Supabase not configured") }
  }
  const { data, error } = await supabase!
    .from("perfis_empresas")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()
  if (error) {
    console.error("Erro ao atualizar perfil da empresa:", error)
    return { data: null, error }
  }
  return { data: data as PerfilEmpresa, error: null }
}

export async function deletarPerfilEmpresa(userId: string): Promise<{ success: boolean; error: any }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: new Error("Supabase not configured") }
  }
  const { error } = await supabase!.from("perfis_empresas").delete().eq("id", userId)
  if (error) {
    console.error("Erro ao deletar perfil da empresa:", error)
    return { success: false, error }
  }
  return { success: true, error: null }
}

// Funções para buscar estatísticas da home page
export async function obterEstatisticasHome(): Promise<{
  totalEmpresas: number
  totalProdutos: number
  totalMunicipios: number
}> {
  if (!isSupabaseConfigured()) {
    // Retorna dados mock se Supabase não estiver configurado
    return {
      totalEmpresas: 150,
      totalProdutos: 500,
      totalMunicipios: 22
    }
  }

  try {
    // Buscar total de empresas ativas
    const { count: totalEmpresas, error: empresasError } = await supabase!
      .from("empresas")
      .select("id", { count: "exact", head: true })
      .eq("status", "ativo")

    if (empresasError) {
      console.error("Erro ao buscar total de empresas:", empresasError)
    }

    // Buscar total de produtos
    const { count: totalProdutos, error: produtosError } = await supabase!
      .from("produtos")
      .select("id", { count: "exact", head: true })

    if (produtosError) {
      console.error("Erro ao buscar total de produtos:", produtosError)
    }

    // Buscar total de municípios únicos
    const { data: municipios, error: municipiosError } = await supabase!
      .from("empresas")
      .select("municipio")
      .eq("status", "ativo")

    if (municipiosError) {
      console.error("Erro ao buscar municípios:", municipiosError)
    }

    // Contar municípios únicos
    const municipiosUnicos = new Set(
      municipios?.map(m => m.municipio).filter(Boolean) || []
    )

    return {
      totalEmpresas: totalEmpresas || 0,
      totalProdutos: totalProdutos || 0,
      totalMunicipios: municipiosUnicos.size || 22 // fallback para 22
    }

  } catch (error) {
    console.error("Erro geral ao buscar estatísticas:", error)
    return {
      totalEmpresas: 150,
      totalProdutos: 500,
      totalMunicipios: 22
    }
  }
}

// Funções para upload de arquivos
export async function uploadLogo(empresaId: string, file: File): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase não está configurado.")
  }

  // Permitir apenas PNG, JPG, JPEG, SVG, WEBP
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/webp"
  ]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Formato de imagem não suportado. Use PNG, JPG, JPEG, SVG ou WEBP.")
  }

  // Upload para o bucket 'empresas-logos'
  const { data, error } = await supabase.storage
    .from("empresas-logos")
    .upload(`${empresaId}/${file.name}`, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    })

  if (error) throw error

  // Retorna a URL pública da logo
  return supabase.storage
    .from("empresas-logos")
    .getPublicUrl(`${empresaId}/${file.name}`).data.publicUrl
}

