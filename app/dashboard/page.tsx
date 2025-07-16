import {
  Building2,
  Package,
  Users,
  BarChart3,
  Settings,
  Edit,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buscarEmpresaPorId, buscarProdutosPorEmpresa, obterAnalytics } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Empresa, Produto } from "@/lib/supabase.types"
import { logout, isLoggedIn, getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

type ProdutoMaisVisto = {
  nome: string
  views: number
}

type AnalyticsData = {
  totalVisualizacoes: number
  visualizacoesMes: number
  produtosMaisVistos: ProdutoMaisVisto[]
}

export default async function DashboardPage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()

  if (!loggedIn || user?.tipo !== "empresa" || !user?.empresa_id) {
    redirect("/login")
  }

  const isConfigured = isSupabaseConfigured()
  const empresaId = user.empresa_id

  let empresa: Empresa | null = null
  let produtos: Produto[] = []
  let analytics: AnalyticsData = {
    totalVisualizacoes: 0,
    visualizacoesMes: 0,
    produtosMaisVistos: [],
  }

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
      // Poderia também considerar redirect("/erro") ou mostrar uma mensagem de erro customizada
      redirect("/login") // Redireciona para login caso erro crítico (opcional)
    }
  }

  // Caso não encontre empresa mesmo após busca (ex: id inválido)
  if (!empresa) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2" aria-label="Página inicial">
                <Building2 className="h-6 w-6 text-green-600" />
                <span className="font-bold text-gray-900">Indústrias do Acre</span>
              </Link>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/empresas/${empresa.id}`} target="_blank" rel="noopener noreferrer" passHref>
                <Button asChild variant="outline" size="sm" aria-label="Ver perfil público da empresa">
                  <a>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Perfil Público
                  </a>
                </Button>
              </Link>
              <Link href="/dashboard/configuracoes" passHref>
                <Button asChild variant="outline" size="sm" aria-label="Configurações do dashboard">
                  <a>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </a>
                </Button>
              </Link>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm" aria-label="Sair da conta">
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {!isConfigured && (
        <div
          className="bg-yellow-100 border-yellow-500 text-yellow-700 px-4 py-3"
          role="alert"
          aria-live="polite"
        >
          <strong className="font-bold">Atenção:</strong>{" "}
          <span className="block sm:inline">
            Banco de dados não configurado. Configure as variáveis de ambiente para o Supabase.
          </span>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Welcome */}
        <section className="mb-8" aria-label="Boas vindas">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {empresa.nome_fantasia}!
          </h1>
          <p className="text-gray-600">Gerencie as informações da sua empresa e produtos</p>
        </section>

        {/* Stats Cards */}
        <section
          className="grid md:grid-cols-4 gap-6 mb-8"
          aria-label="Estatísticas rápidas"
        >
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
                <Badge variant="secondary">{empresa.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Perfil aprovado</p>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="empresa" className="space-y-6" aria-label="Seções do painel">
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
                  <Link href="/dashboard/editar" passHref>
                    <Button asChild aria-label="Editar informações da empresa">
                      <a>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </a>
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Nome Fantasia</h4>
                    <p className="text-gray-600">{empresa.nome_fantasia}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Razão Social</h4>
                    <p className="text-gray-600">{empresa.razao_social}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">CNPJ</h4>
                    <p className="text-gray-600">{empresa.cnpj}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Setor</h4>
                    <Badge variant="secondary">{empresa.setor_empresa}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Município</h4>
                    <p className="text-gray-600">{empresa.municipio}, AC</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                    <Badge variant="secondary">{empresa.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos">
            {/* TODO: implementar listagem e edição dos produtos */}
          </TabsContent>

          <TabsContent value="arquivos">
            {/* TODO: implementar gestão de arquivos */}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visualizações do Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{analytics.totalVisualizacoes}</div>
                  <p className="text-sm text-gray-600">Visualizações nos últimos 30 dias</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Visualizados</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.produtosMaisVistos.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.produtosMaisVistos.map((p) => (
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
      </main>
    </div>
  )
}
