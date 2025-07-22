import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function getLastCompanies(limit = 6) {
  // Verifica se Supabase está configurado
  if (!isSupabaseConfigured() || !supabase) {
    console.error("Supabase não está configurado!");
    return [];
  }

  try {
    console.log("Buscando empresas do Supabase...");
    
    // Buscar empresas ativas OU pendentes (para desenvolvimento)
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .in('status', ['ativo', 'pendente']) // Aceita tanto ativo quanto pendente
      .order('created_at', { ascending: false })
      .limit(limit)

    console.log("Empresas encontradas:", { data, error });

    if (error) {
      console.error("Erro ao buscar empresas do Supabase:", error);
      console.error("Código do erro:", error.code);
      console.error("Detalhes do erro:", error.details);
      return [];
    }

    console.log(`${data?.length || 0} empresas encontradas no Supabase`);
    return data || [];
  } catch (err) {
    console.error("Erro na conexão com Supabase:", err);
    return [];
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