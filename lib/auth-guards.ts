import { createServerSideClient } from "./supabase"
import { redirect } from "next/navigation"

/**
 * Obtém o usuário logado e identifica seu tipo de forma segura
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerSideClient()
  if (!supabase) return null

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  
  // O tipo pode estar no metadado (rápido) ou no banco (seguro)
  const tipoMetadata = user.user_metadata?.tipo
  
  return {
    ...user,
    tipo: tipoMetadata
  }
}

/**
 * Garante que o usuário está logado
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

/**
 * Garante que o usuário é um administrador (Verificação Rígida)
 */
export async function requireAdmin() {
  const user = await requireAuth()
  
  const supabase = await createServerSideClient()
  const { data: admin } = await supabase
    .from("admins")
    .select("ativo")
    .eq("id", user.id)
    .single()

  if (!admin || !admin.ativo) {
    redirect("/login")
  }

  return { ...user, tipo: "admin" }
}

/**
 * Garante que o usuário é uma empresa e tem acesso a ID específico
 */
export async function requireEmpresa(empresaId?: string) {
  const user = await requireAuth()
  
  const supabase = await createServerSideClient()
  const { data: perfil } = await supabase
    .from("perfis_empresas")
    .select("empresa_id")
    .eq("id", user.id)
    .single()

  if (!perfil || !perfil.empresa_id) {
    // Se não for empresa, verifica se é admin (admins podem ver dashboards de empresas)
    try {
      await requireAdmin()
      return { ...user, tipo: "admin", empresa_id: empresaId }
    } catch {
      redirect("/login")
    }
  }

  if (empresaId && perfil.empresa_id !== empresaId) {
    // Tenta bypass de admin
    try {
      await requireAdmin()
    } catch {
      throw new Error("Acesso negado a esta empresa.")
    }
  }
  
  return { ...user, tipo: "empresa", empresa_id: perfil.empresa_id }
}
