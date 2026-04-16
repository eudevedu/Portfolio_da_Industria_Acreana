import AdminDashboard from "@/components/AdminDashboard"
import { obterEstatisticasAdmin, buscarEmpresasAdmin } from "@/lib/admin"
import { isSupabaseConfigured } from "@/lib/supabase"
import { isLoggedIn, isAdmin as checkIsAdmin, getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Empresa } from "@/lib/supabase.types"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const loggedIn = await isLoggedIn()
  const userIsAdmin = await checkIsAdmin()
  const user = await getCurrentUser()

  if (!loggedIn || !userIsAdmin) {
    redirect("/admin/login")
  }

  const isConfigured = isSupabaseConfigured()

  let stats = {
    totalEmpresas: 0,
    empresasAtivas: 0,
    empresasPendentes: 0,
    empresasInativas: 0,
    novosCadastrosMes: 0,
    totalProdutos: 0,
    visualizacoesTotais: 0,
  }
  let initialEmpresas: Empresa[] = []
  let loadingInitialData = true

  if (isConfigured) {
    try {
      stats = await obterEstatisticasAdmin()
      initialEmpresas = await buscarEmpresasAdmin({})
    } catch (err) {
      console.error("Erro ao carregar dados iniciais do admin:", err)
    } finally {
      loadingInitialData = false
    }
  } else {
    loadingInitialData = false
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {loadingInitialData ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent shadow-lg shadow-green-100" />
        </div>
      ) : (
        <AdminDashboard 
          initialStats={stats} 
          initialEmpresas={initialEmpresas} 
          isConfiguredProp={isConfigured} 
          user={user} 
        />
      )}
    </div>
  )
}
