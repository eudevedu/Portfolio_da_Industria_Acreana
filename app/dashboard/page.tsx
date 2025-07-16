import { Building2, Settings, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buscarEmpresaPorId, buscarProdutosPorEmpresa, obterAnalytics } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Empresa, Produto } from "@/lib/supabase.types" // Importa o tipo do novo arquivo
import { AuthGuard } from "@/components/auth-guard"
import { logout, isLoggedIn, getCurrentUser } from "@/lib/auth" // Importa Server Actions e funções de auth
import { redirect } from "next/navigation" // Para redirecionamento server-side
import { DashboardContent } from "@/components/dashboard-content" // Novo Client Component

// Esta página agora é um Server Component
export default async function DashboardPage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()

  // Redirecionamento server-side se não estiver logado ou não for tipo 'empresa'
  if (!loggedIn || user?.tipo !== "empresa") {
    redirect("/login")
  }

  const isConfigured = isSupabaseConfigured()

  // ID da empresa (vem do usuário logado)
  const empresaId = user?.empresa_id || "1" // Usar ID mock "1" se empresa_id não estiver definido (para testes)

  let empresa: Empresa | null = null
  let produtos: Produto[] = []
  let analytics = {
    totalVisualizacoes: 0,
    visualizacoesMes: 0,
    produtosMaisVistos: [],
  }
  let loadingData = true

  if (isConfigured && empresaId) {
    try {
      const [empresaData, produtosData, analyticsData] = await Promise.all([
        buscarEmpresaPorId(empresaId),
        buscarProdutosPorEmpresa(empresaId),
        obterAnalytics(empresaId),
      ])

      empresa = empresaData
      produtos = produtosData
      analytics = analyticsData
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
      // Em caso de erro, pode-se redirecionar ou mostrar uma mensagem
    } finally {
      loadingData = false
    }
  } else {
    loadingData = false // Se não configurado ou sem empresaId, não está "carregando" dados do DB
  }

  return (
    // AuthGuard é um Client Component, recebe props do Server Component
    <AuthGuard isLoggedIn={loggedIn} isAdmin={user?.tipo === "admin"} requireAuth={true} requireAdmin={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-gray-900">Indústrias do Acre</span>
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil Público
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
                {/* O botão de logout agora usa uma Server Action diretamente */}
                <form action={logout}>
                  <Button type="submit" variant="outline" size="sm">
                    Sair
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {!isConfigured && (
          <div className="bg-yellow-100 border-yellow-500 text-yellow-700 px-4 py-3" role="alert">
            <strong className="font-bold">Atenção:</strong>
            <span className="block sm:inline">
              Banco de dados não configurado. Configure as variáveis de ambiente para o Supabase.
            </span>
          </div>
        )}

        {loadingData ? (
          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent" />
          </div>
        ) : (
          // Passa os dados iniciais para o novo Client Component
          <DashboardContent
            initialEmpresa={empresas}
            initialProdutos={produtos}
            initialAnalytics={analytics}
            isConfiguredProp={isConfigured}
          />
        )}
      </div>
    </AuthGuard>
  )
}
