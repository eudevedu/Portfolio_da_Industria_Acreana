"use client"
import Link from "next/link"
import { Building2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import { logout, isLoggedIn, isAdmin as checkIsAdmin } from "@/lib/auth" // Importa Server Actions e funções de auth
import { buscarEmpresaPorId } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Empresa } from "@/lib/supabase.types" // Importa o tipo do novo arquivo
import { notFound, redirect } from "next/navigation" // Para notFound e redirect server-side
import { EmpresaDetailAdminContent } from "@/components/empresa-detail-admin-content" // Importa o novo Client Component

// Garante que esta página seja sempre renderizada no servidor
export const dynamic = "force-dynamic"

// Esta página agora é um Server Component
export default async function AdminEmpresaDetailPage({ params }: { params: { id: string } }) {
  const empresaId = params.id

  const loggedIn = await isLoggedIn()
  const userIsAdmin = await checkIsAdmin()

  // Redirecionamento server-side se não for admin
  if (!loggedIn || !userIsAdmin) {
    redirect("/login")
  }

  const isConfigured = isSupabaseConfigured()

  let empresa: Empresa | null = null
  let loadingInitialData = true

  if (isConfigured && empresaId) {
    try {
      empresa = await buscarEmpresaPorId(empresaId)
      if (!empresa) {
        notFound() // Usa a função notFound do Next.js para 404
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da empresa:", err)
      // Em caso de erro, pode-se redirecionar ou mostrar uma mensagem genérica
      notFound() // Trata erro de busca como não encontrado
    } finally {
      loadingInitialData = false
    }
  } else {
    // Modo mock para desenvolvimento local sem Supabase configurado
    const mockEmpresasModule = await import("@/lib/database")
    const mockEmpresas = await mockEmpresasModule.buscarEmpresas()
    empresa = mockEmpresas.find((emp) => emp.id === empresaId)
    if (!empresa) {
      notFound()
    }
    loadingInitialData = false
  }

  return (
    <AuthGuard isLoggedIn={loggedIn} isAdmin={userIsAdmin} requireAuth={true} requireAdmin={true}>
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
                <span className="text-gray-600">Detalhes da Empresa</span>
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
          // Passa os dados iniciais para o novo Client Component
          <EmpresaDetailAdminContent initialEmpresa={empresa!} isConfiguredProp={isConfigured} />
        )}
      </div>
    </AuthGuard>
  )
}
