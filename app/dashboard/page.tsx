import {
  
  Package,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Eye,
  Upload,
  FileText,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buscarEmpresaPorId, buscarProdutosPorEmpresa, obterAnalytics, buscarArquivosPorEmpresa } from "../../lib/database" // Caminho relativo
import { isSupabaseConfigured } from "../../lib/supabase" // Caminho relativo
import type { Empresa, Produto } from "../../lib/supabase.types" // Caminho relativo
import { AuthGuard } from "@/components/auth-guard"
import { logout, isLoggedIn, getCurrentUser } from "../../lib/auth" // Caminho relativo
import { redirect } from "next/navigation" // Para redirecionamento server-side
import { CompanyInfoCard } from "@/components/company-info-card" // Importa o componente de edição
import EmpresaDashboard from "./EmpresaDashboard"
import ProdutosManager from "@/components/ProdutosManager"
import ArquivosManager from "@/components/ArquivosManager"
import { LogoSeict } from "@/components/LogoIndustria"
import EmpresaDashboardWrapper from "@/components/EmpresaDashboardWrapper"

// Força renderização dinâmica devido ao uso de cookies
export const dynamic = 'force-dynamic'

// Esta página agora é um Server Component
export default async function DashboardPage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()

  // Corrija o tipo para aceitar "empresa" ou "admin"
  if (!loggedIn || (user?.tipo !== "empresa" && user?.tipo !== "admin")) {
    redirect("/login")
  }

  const isConfigured = isSupabaseConfigured()
  const empresaId = user?.empresa_id || "1"

  let empresa: Empresa | null = null
  let produtos: Produto[] = []
  let arquivos: any[] = []
  let analytics: DashboardData = {
    totalVisualizacoes: 0,
    visualizacoesMes: 0,
    produtosMaisVistos: [],
    produtosDoMes: 0,
  }
  let loadingData = true

  if (isConfigured && empresaId) {
    try {
      const [empresaData, produtosData, analyticsData, arquivosData] = await Promise.all([
        buscarEmpresaPorId(empresaId),
        buscarProdutosPorEmpresa(empresaId),
        obterAnalytics(empresaId),
        buscarArquivosPorEmpresa(empresaId),
      ])
      empresa = empresaData
      produtos = produtosData
      analytics = analyticsData
      arquivos = arquivosData
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    } finally {
      loadingData = false
    }
  } else {
    loadingData = false
  }

  return (
    <AuthGuard
      isLoggedIn={loggedIn}
      isAdmin={user?.tipo === "admin"}
      requireAuth={true}
      requireAdmin={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <LogoSeict className="h-14 w-14 text-green-600" />
                  <span className="font-bold text-gray-900">Portfólio das Indústrias do Acre</span>
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                {user?.empresa_id ? (
                  <Link href={`/empresas/${user.empresa_id}?from=dashboard`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil Público
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    Perfil não disponível
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/configuracoes">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Link>
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
          <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bem-vindo, {empresa?.nome_fantasia || "Usuário"}!
              </h1>
              <p className="text-gray-600">Gerencie as informações da sua empresa e produtos</p>
            </div>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{produtos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics.produtosDoMes} este mês
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalVisualizacoes}</div>
                  <p className="text-xs text-muted-foreground">+{analytics.visualizacoesMes} este mês</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant="secondary">{empresa?.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Perfil aprovado</p>
                </CardContent>
              </Card>
            </div>
            {/* Main Content */}
            <Tabs defaultValue="empresa" className="space-y-6">
              <TabsList>
                <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="empresa">
                {/* Integração do CompanyInfoCard aqui */}
                <CompanyInfoCard initialData={empresa} empresaId={empresaId} />
              </TabsContent>
              <TabsContent value="produtos">
                <ProdutosManager />
              </TabsContent>
              <TabsContent value="arquivos">
                <ArquivosManager arquivos={arquivos} empresaId={empresaId} />
              </TabsContent>
              <TabsContent value="analytics">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visualizações do Perfil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">{analytics.totalVisualizacoes}</div>
                      <p className="text-sm text-gray-600">
                        Visualizações nos últimos 30 dias
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Produtos Mais Visualizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.produtosMaisVistos.map((produto) => (
                          <div className="flex justify-between" key={produto.nome}>
                            <span className="text-sm">{produto.nome}</span>
                            <span className="text-sm font-medium">{produto.views} views</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

// Troque o tipo do analytics para usar DashboardData:
interface DashboardData {
  totalVisualizacoes: number
  visualizacoesMes: number
  produtosMaisVistos: { nome: string; views: number }[]
  produtosDoMes: number
}
