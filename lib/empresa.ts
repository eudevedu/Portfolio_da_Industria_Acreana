import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function getLastCompanies(limit = 6) {
  // Verifica se Supabase está configurado
  if (!isSupabaseConfigured() || !supabase) {
    const error = new Error("Supabase não está configurado - verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY")
    console.error("❌ Supabase config error:", {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
    })
    throw error
  }

  try {
    console.log('🔍 Buscando empresas - tentativa de conexão com Supabase...')
    
    // Buscar empresas ativas e pendentes
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .in('status', ['ativo', 'pendente'])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error("❌ Erro na query Supabase:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Erro na consulta ao banco de dados: ${error.message}`)
    }

    console.log(`✅ Query executada com sucesso - ${data?.length || 0} empresas encontradas`)
    return data || []
    
  } catch (err) {
    console.error("❌ Erro na função getLastCompanies:", err)
    
    if (err instanceof Error) {
      // Re-throw para manter a mensagem original
      throw err
    } else {
      throw new Error("Erro desconhecido na conexão com o banco de dados")
    }
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