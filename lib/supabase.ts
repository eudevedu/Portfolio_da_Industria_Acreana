import { createClient } from "@supabase/supabase-js"
import type { Empresa, Produto, Arquivo, User, Analytics } from "./supabase.types"

// Tipos para as tabelas do Supabase
export type { Empresa, Produto, Arquivo, User, Analytics }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is not set. Database functions will not work.")
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey
}


