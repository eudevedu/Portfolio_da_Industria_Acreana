import Link from "next/link"
import { Building2, Settings, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { obterEstatisticasAdmin, buscarEmpresasAdmin } from "@/lib/admin"
import { isSupabaseConfigured } from "@/lib/supabase"
import { logout, isLoggedIn, isAdmin as checkIsAdmin, getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Empresa } from "@/lib/supabase.types"
import { AdminContent } from "@/components/admin-content"
import { LogoSeict } from "@/components/LogoIndustria"
import { Badge } from "@/components/ui/badge"

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
      {/* Premium Admin Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-3 group">
                <div className="p-2 bg-slate-900 rounded-xl shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform">
                  <LogoSeict className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-display font-black tracking-tight leading-none text-slate-900 uppercase">ADMIN</span>
                  <span className="text-[0.6rem] font-bold tracking-[0.2em] text-slate-400 uppercase leading-none mt-1">Portal da Indústria</span>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1 ml-4 py-1 px-1 bg-slate-100/50 rounded-xl border border-slate-200/50">
                 <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-slate-900 border border-slate-200/60">
                    <LayoutDashboard className="h-4 w-4 text-green-600" />
                    Dashboard
                 </Link>
                 <Link href="/" className="flex items-center gap-2 px-4 py-2 hover:bg-white/50 rounded-lg text-sm font-medium text-slate-600 transition-colors">
                    <Building2 className="h-4 w-4" />
                    Site Público
                 </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-slate-900">{user?.email || 'Administrador'}</span>
                <Badge variant="secondary" className="text-[0.6rem] uppercase tracking-wider font-black bg-green-50 text-green-700 border-green-100 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Sistema Seguro
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-xl border-slate-200 hover:bg-slate-50" asChild>
                  <Link href="/admin/configuracoes">
                    <Settings className="h-5 w-5 text-slate-500" />
                  </Link>
                </Button>
                
                <form action={logout}>
                  <Button type="submit" variant="ghost" size="icon" className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {loadingInitialData ? (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent shadow-lg shadow-green-100" />
        </div>
      ) : (
        <main className="max-w-[1600px] mx-auto py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <AdminContent initialStats={stats} initialEmpresas={initialEmpresas} isConfiguredProp={isConfigured} />
        </main>
      )}
    </div>
  )
}
