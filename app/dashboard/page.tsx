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
  LayoutDashboard,
  LogOut,
  Building2,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buscarEmpresaPorId, buscarProdutosPorEmpresa, obterAnalytics, buscarArquivosPorEmpresa } from "../../lib/database"
import { isSupabaseConfigured } from "../../lib/supabase"
import type { Empresa, Produto } from "../../lib/supabase.types"
import { AuthGuard } from "@/components/auth-guard"
import { logout, isLoggedIn, getCurrentUser } from "../../lib/auth"
import { redirect } from "next/navigation"
import { CompanyInfoCard } from "@/components/company-info-card"
import ProdutosManager from "@/components/ProdutosManager"
import ArquivosManager from "@/components/ArquivosManager"
import { LogoSeict } from "@/components/LogoIndustria"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()

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
      <div className="min-h-screen bg-[#f8fafc] flex">
        <Tabs defaultValue="empresa" className="flex-1 flex flex-col h-full">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
          <div className="p-8 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-green-600 rounded-xl shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform">
                <LogoSeict className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-black tracking-tight leading-none text-slate-900 uppercase">PORTFÓLIO</span>
                <span className="text-[0.6rem] font-bold tracking-[0.2em] text-green-600 uppercase">Indústria Acreana</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-6 space-y-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4 px-3">Menu Principal</p>
            <TabsList className="flex flex-col w-full bg-transparent p-0 gap-2 h-auto">
              {[
                { id: 'empresa', label: 'Dados da Empresa', icon: Building2 },
                { id: 'produtos', label: 'Gestão de Produtos', icon: Package },
                { id: 'arquivos', label: 'Arquivos e Mídias', icon: ImageIcon },
                { id: 'analytics', label: 'Desempenho', icon: BarChart3 },
              ].map((item) => (
                <TabsTrigger 
                  key={item.id} 
                  value={item.id}
                  className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-slate-600 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none hover:bg-slate-50 transition-all font-medium border-transparent"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="pt-8 space-y-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4 px-3">Atalhos</p>
              <Link href={`/empresas/${empresaId}`} target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium group">
                <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                <span>Ver Perfil Público</span>
              </Link>
              <Link href="/dashboard/configuracoes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium group">
                <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
                <span>Configurações</span>
              </Link>
            </div>
          </nav>

          <div className="p-6 border-t border-slate-100">
            <form action={logout}>
              <Button type="submit" variant="ghost" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-bold">
                <LogOut className="h-5 w-5" />
                Sair da Conta
              </Button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white border-b px-4 h-16 flex items-center justify-between sticky top-0 z-40">
              <div className="flex items-center gap-2">
                <LogoSeict className="h-8 w-8" />
                <span className="font-display font-black text-sm">PORTFÓLIO</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard/configuracoes"><Settings className="h-5 w-5" /></Link>
                </Button>
                <form action={logout}>
                  <Button type="submit" variant="ghost" size="icon" className="text-red-600">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </header>

            {/* Content Header */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200/60 px-8 py-6 hidden lg:flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-black tracking-tight text-slate-900">
                  Dashboard Industrial
                </h1>
                <p className="text-sm text-slate-500 font-medium">Bem-vindo(a) de volta, <span className="text-green-600 font-bold">{empresa?.nome_fantasia || "Admin"}</span></p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-slate-900">{user?.email}</span>
                  <Badge variant="outline" className="text-[0.6rem] uppercase tracking-wider font-bold bg-slate-50 text-slate-500 border-slate-200">
                    {user?.tipo} - {empresa?.status || 'Ativo'}
                  </Badge>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200 flex items-center justify-center text-white font-black">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            </header>

            <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
              {!isConfigured && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 text-amber-800 animate-pulse">
                  <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Aviso de Configuração</h3>
                    <p className="text-sm opacity-80">O banco de dados não está configurado corretamente. Alguns recursos podem não funcionar.</p>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="glass shadow-xl shadow-slate-200/50 border-white/40 overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Produtos</CardTitle>
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                      <Package className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-display font-black text-slate-900 mb-1">{produtos.length}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.7rem] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{analytics.produtosDoMes}</span>
                      <span className="text-[0.7rem] font-medium text-slate-400">novos este mês</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass shadow-xl shadow-slate-200/50 border-white/40 overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Alcance</CardTitle>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Eye className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-display font-black text-slate-900 mb-1">{analytics.totalVisualizacoes}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.7rem] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+{analytics.visualizacoesMes}</span>
                      <span className="text-[0.7rem] font-medium text-slate-400">views este mês</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass shadow-xl shadow-slate-200/50 border-white/40 overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Status Perfil</CardTitle>
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                       <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                         {empresa?.status || 'Ativo'}
                       </Badge>
                    </div>
                    <p className="text-[0.7rem] font-medium text-slate-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tab Contents */}
              <div className="space-y-12">
                <TabsContent value="empresa" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                  <CompanyInfoCard initialData={empresa} empresaId={empresaId} />
                </TabsContent>
                
                <TabsContent value="produtos" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                  <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-2xl shadow-slate-200/60">
                    <ProdutosManager />
                  </div>
                </TabsContent>
                
                <TabsContent value="arquivos" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                  <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-2xl shadow-slate-200/60">
                    <ArquivosManager arquivos={arquivos} empresaId={empresaId} />
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-0 outline-none animate-in fade-in-50 duration-500">
                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="glass rounded-[2rem] border-white/40 shadow-xl overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                        <CardTitle className="font-display font-black text-slate-900">Visualizações Detalhadas</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="text-5xl font-display font-black text-slate-900 mb-2">{analytics.totalVisualizacoes}</div>
                        <p className="text-sm text-slate-500 font-medium">Total de interações acumuladas nos últimos 30 dias</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="glass rounded-[2rem] border-white/40 shadow-xl overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                        <CardTitle className="font-display font-black text-slate-900">Destaques</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="space-y-4">
                          {analytics.produtosMaisVistos.length > 0 ? (
                            analytics.produtosMaisVistos.map((produto) => (
                              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors" key={produto.nome}>
                                <span className="text-sm font-bold text-slate-700">{produto.nome}</span>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-bold">{produto.views} views</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400 text-center py-4">Sem dados de produtos no momento</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </main>
          </div>
        </Tabs>
      </div>
    </AuthGuard>
  )
}

interface DashboardData {
  totalVisualizacoes: number
  visualizacoesMes: number
  produtosMaisVistos: { nome: string; views: number }[]
  produtosDoMes: number
}
