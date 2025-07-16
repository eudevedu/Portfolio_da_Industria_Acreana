import Link from "next/link"
import { Building2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { obterEstatisticasAdmin, buscarEmpresasAdmin } from "@/lib/admin"
import { isSupabaseConfigured } from "@/lib/supabase"
import { logout, isLoggedIn, isAdmin as checkIsAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Empresa } from "@/lib/supabase.types"
import { AdminContent } from "@/components/admin-content" // Importa o Client Component

// Garante que esta página seja sempre renderizada no servidor
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const loggedIn = await isLoggedIn()
  const userIsAdmin = await checkIsAdmin()

  // Redirecionamento server-side se não for admin
  if (!loggedIn || !userIsAdmin) {
    redirect("/login")
  }

  const isConfigured = isSupabaseConfigured()

  // Busca dados iniciais no servidor
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
      initialEmpresas = await buscarEmpresasAdmin({}) // Busca todas as empresas inicialmente
    } catch (err) {
      console.error("Erro ao carregar dados iniciais do admin:", err)
    } finally {
      loadingInitialData = false
    }
  } else {
    loadingInitialData = false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-green-600" />
                <span className="font-bold text-gray-900">Admin Indústrias do Acre</span>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      {loadingInitialData ? (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent" />
        </div>
      ) : (
        // Passa os dados iniciais para o Client Component
        <AdminContent initialStats={stats} initialEmpresas={initialEmpresas} isConfiguredProp={isConfigured} />
      )}
    </div>
  )
}
