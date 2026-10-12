import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { createClient as createLegacyClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseKey
export const isSupabaseAdminConfigured = () => !!supabaseUrl && !!process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Cliente para Browser (Client Components)
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado.')
    return null as any
  }
  return createBrowserClient(supabaseUrl!, supabaseKey!)
}

/**
 * Cliente para Server (Server Components, Actions, Route Handlers)
 */
export async function createServerSideClient() {
  if (!isSupabaseConfigured()) {
    return null as any
  }

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
          // Ignorado em Server Components (pre-rendering)
        }
      },
    },
  })
}

/**
 * Cliente Admin (Service Role) - APENAS SERVER-SIDE
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceKey) {
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
 * Singleton de compatibilidade (Legado).
 * @deprecated Use createClient() ou createServerSideClient() em Next.js 15.
 */
export const supabase = isSupabaseConfigured() 
  ? createLegacyClient(supabaseUrl!, supabaseKey!)
  : null
