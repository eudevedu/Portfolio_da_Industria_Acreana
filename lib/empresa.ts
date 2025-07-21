import { supabase } from "@/lib/supabase"

export async function getLastCompanies(limit = 6) {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('created_at', { ascending: false }) // ajuste aqui!
    .limit(limit)

  if (error) throw error
  return data || []
}