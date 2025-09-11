import Link from "next/link"
import { Building2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import { logout, isLoggedIn, isAdmin as checkIsAdmin } from "@/lib/auth"
import { buscarEmpresaPorId } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Empresa } from "@/lib/supabase.types"
import { notFound, redirect } from "next/navigation"
import { EmpresaDetailAdminContent } from "@/components/empresa-detail-admin-content"
import { BrasaoAcre } from "@/components/LogoIndustria"

export const dynamic = "force-dynamic"

export default async function AdminEmpresaDetailPage({ params }: { params: { id: string } }) {
  const empresaId = params.id

  if (!empresaId) {
    notFound()
  }

  const loggedIn = await isLoggedIn()
  const userIsAdmin = await checkIsAdmin()

  if (!loggedIn || !userIsAdmin) {
    redirect("/login")
  }

  const isConfigured = isSupabaseConfigured()

  let empresa: Empresa | null = null

  if (isConfigured && empresaId) {
    try {
      empresa = await buscarEmpresaPorId(empresaId)
      if (!empresa) {
        notFound()
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da empresa:", err)
      notFound()
    }
  } else {
    const mockEmpresasModule = await import("@/lib/database")
    const mockEmpresas = await mockEmpresasModule.buscarEmpresas()
    empresa = mockEmpresas.find((emp) => emp.id === empresaId) ?? null
    if (!empresa) {
      notFound()
    }
  }

  if (!empresa) {
    notFound()
  }

  return (
    <AuthGuard isLoggedIn={loggedIn} isAdmin={userIsAdmin} requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrasaoAcre className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg">Detalhes da Empresa</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="outline">Voltar</Button>
              </Link>
              <Link href="/admin/configuracoes">
                <Button variant="ghost">
                  <Settings className="h-4 w-4 mr-1" /> Configurações
                </Button>
              </Link>
              <Button variant="destructive" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </header>
        <EmpresaDetailAdminContent initialEmpresa={empresa} isConfiguredProp={isConfigured} />
      </div>
    </AuthGuard>
  )
}