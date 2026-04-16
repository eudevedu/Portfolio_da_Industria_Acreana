import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Debug: verificar se as variáveis estão sendo carregadas
if (typeof window === 'undefined') { // Apenas no servidor
  console.log('🔍 Verificando variáveis de ambiente:')
  console.log('- SUPABASE_URL:', !!supabaseUrl)
  console.log('- SUPABASE_ANON_KEY:', !!supabaseKey)
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  console.log('- SERVICE_ROLE_KEY Length:', supabaseServiceKey?.length || 0)
}

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Cliente com permissões administrativas para operações que requerem service role
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export function isSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseAdminConfigured() {
  const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('🔍 isSupabaseAdminConfigured:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    isConfigured
  });
  return isConfigured;
}

