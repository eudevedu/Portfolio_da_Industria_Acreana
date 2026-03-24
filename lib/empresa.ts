import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function getLastCompanies(limit = 6) {
  // Verifica se Supabase está configurado. Se não, usa mock data.
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("Supabase não configurado em getLastCompanies, usando mock data")
    const { buscarEmpresas } = await import("./database")
    return await buscarEmpresas({ status: 'ativo' }).then(res => res.slice(0, limit))
  }

  try {
    // Buscar apenas empresas ativas com relações
    const { data, error } = await supabase
      .from('empresas')
      .select('*, produtos(*), arquivos(*)')
      .eq('status', 'ativo')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Erro na consulta ao banco de dados: ${error.message}`)
    }

    return data || []
    
  } catch (err) {
    console.error("Erro em getLastCompanies:", err)
    return []
  }
}

// Função para buscar uma empresa específica por ID
export async function getEmpresaById(id: string) {
  if (!isSupabaseConfigured() || !supabase) {
    console.error("Supabase não está configurado!");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error("Erro ao buscar empresa por ID:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erro na conexão com Supabase:", err);
    return null;
  }
}

// Função para buscar todas as empresas ativas
export async function getAllCompanies() {
  if (!isSupabaseConfigured() || !supabase) {
    console.error("Supabase não está configurado!");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('status', 'ativo')
      .order('nome_fantasia', { ascending: true })

    if (error) {
      console.error("Erro ao buscar todas as empresas:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erro na conexão com Supabase:", err);
    return [];
  }
}

// Função para buscar empresas por setor
export async function getCompaniesBySetor(setor: string) {
  if (!isSupabaseConfigured() || !supabase) {
    console.error("Supabase não está configurado!");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('status', 'ativo')
      .ilike('setor_economico', `%${setor}%`)
      .order('nome_fantasia', { ascending: true })

    if (error) {
      console.error("Erro ao buscar empresas por setor:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erro na conexão com Supabase:", err);
    return [];
  }
}