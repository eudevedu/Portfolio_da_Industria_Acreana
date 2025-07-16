import {
  Building2,
  Package,
  Users,
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
import { buscarEmpresaPorId, buscarProdutosPorEmpresa, obterAnalytics } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Empresa, Produto } from "@/lib/supabase.types"
import { logout, isLoggedIn, getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()

  // ✅ Redireciona caso não logado ou não seja empresa
  if (!loggedIn || user?.tipo !== "empresa" || !user?.empresa_id) {
    redirect("/login")
  }

  const isConfigured = isSupabaseConfigured()
  const empresaId = user.empresa_id

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
    } finally {
      loadingData = false
    }
  } else {
    loadingData = false
  }

  return (
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
              <Link href={`/empresas/${empresa?.id}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil Público
                </Button>
              </Link>
              <Link href="/dashboard/configuracoes">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </Link>
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
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo, {empresa?.nome_fantasia || "Usuário"}!
            </h1>
            <p className="text-gray-600">Gerencie as informações da sua empresa e produtos</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{produtos.length}</div>
                <p className="text-xs text-muted-foreground">+2 este mês</p>
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
                <CardTitle className="text-sm font-medium">Contatos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">+8 esta semana</p>
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

          {/* Tabs */}
          <Tabs defaultValue="empresa" className="space-y-6">
            <TabsList>
              <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="empresa">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Informações da Empresa</CardTitle>
                      <CardDescription>Gerencie os dados básicos da sua empresa</CardDescription>
                    </div>
                    <Link href="/dashboard/editar">
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div><h4 className="font-medium text-gray-900 mb-2">Nome Fantasia</h4><p className="text-gray-600">{empresa?.nome_fantasia}</p></div>
                    <div><h4 className="font-medium text-gray-900 mb-2">Razão Social</h4><p className="text-gray-600">{empresa?.razao_social}</p></div>
                    <div><h4 className="font-medium text-gray-900 mb-2">CNPJ</h4><p className="text-gray-600">{empresa?.cnpj}</p></div>
                    <div><h4 className="font-medium text-gray-900 mb-2">Setor</h4><Badge variant="secondary">{empresa?.setor_empresa}</Badge></div>
                    <div><h4 className="font-medium text-gray-900 mb-2">Município</h4><p className="text-gray-600">{empresa?.municipio}, AC</p></div>
                    <div><h4 className="font-medium text-gray-900 mb-2">Status</h4><Badge variant="secondary">{empresa?.status}</Badge></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="produtos">
              {/* Igual: seus botões de Editar e Visualizar aqui podem ser Links depois */}
            </TabsContent>

            <TabsContent value="arquivos">
              {/* Igual */}
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Visualizações do Perfil</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{analytics.totalVisualizacoes}</div>
                    <p className="text-sm text-gray-600">Visualizações nos últimos 30 dias</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Produtos Mais Visualizados</CardTitle></CardHeader>
                  <CardContent>
                    {analytics.produtosMaisVistos.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.produtosMaisVistos.map((p: any) => (
                          <div key={p.nome} className="flex justify-between">
                            <span className="text-sm">{p.nome}</span>
                            <span className="text-sm font-medium">{p.views} views</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Sem dados ainda.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
