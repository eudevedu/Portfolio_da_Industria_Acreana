import { createServerClient } from '@supabase/ssr'
import { createClient as createLegacyClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseKey
export const isSupabaseAdminConfigured = () => !!supabaseUrl && !!process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Cria um cliente Supabase para Client Components.
 * Em Next.js 15, o recomendado é usar o createBrowserClient do @supabase/ssr
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado. createClient retornando null.')
    return null as any
  }
  
  // Re-importing dynamic to avoid issues in some environments
  const { createBrowserClient } = require('@supabase/ssr')
  return createBrowserClient(supabaseUrl!, supabaseKey!)
}

/**
 * Cria um cliente Supabase para Server Components, Route Handlers e Actions.
 * Utiliza o novo padrão de cookies assíncronos do Next.js 15.
 */
export async function createServerSideClient() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado. createServerSideClient retornando null.')
    return null as any
  }

  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorado propositalmente em Server Components (pre-rendering)
          }
        },
      },
    })
  } catch (error) {
    // Fallback para ambientes sem cookies (ex: builds estáticos)
    return createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
          getAll() { return [] },
          setAll() {}
      }
    })
  }
}

/**
 * Cliente admin com permissões totais via Service Role.
 * Usado exclusivamente em operações seguras no lado do servidor.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY ou URL não configurados.')
    return null as any
  }

  return createServerClient(supabaseUrl, serviceKey, {
    cookies: {
      getAll() { return [] },
      setAll() {}
    }
  })
}

/**
 * Singleton de compatibilidade resiliente (uso em scripts legado).
 */
export const supabase = isSupabaseConfigured() 
  ? createLegacyClient(supabaseUrl!, supabaseKey!)
  : null
