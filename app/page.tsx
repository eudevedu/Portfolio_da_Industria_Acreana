import { Search, MapPin, Plus } from "lucide-react"
import { LogoSeict } from "@/components/LogoIndustria"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isLoggedIn, getCurrentUser } from "@/lib/auth"
import { getLastCompanies } from "@/lib/empresa"
import { obterEstatisticasHome } from "@/lib/database"
import HomeCompanyGrid from "@/components/HomeCompanyGrid"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function HomePage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()
  const dashboardLink = user?.tipo === "admin" ? "/admin" : "/dashboard"

  // Busque as últimas 6 empresas cadastradas
  let empresas: any[] = []
  let errorMsg = null

  try {
    empresas = await getLastCompanies(6)
  } catch (error) {
    errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
    empresas = []
  }

  // Busca estatísticas dinâmicas
  const stats = await obterEstatisticasHome()

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like feel */}
        <div className="absolute inset-0 z-0">
          <img
            src="/acre.jpg"
            alt="Acre Rural Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-green-900/60 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center animate-fade-in">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm font-medium hover:bg-white/30 transition-colors">
            Portfólio Industrial do Acre
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-6 leading-[1.1] tracking-tight text-balance">
            Conectando a Indústria <span className="text-primary-foreground underline decoration-primary/50 underline-offset-8">Acreana</span> ao Futuro
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
            A plataforma oficial que destaca o potencial produtivo do nosso estado. Encontre empresas, produtos e serviços com excelência regional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/buscar">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Search className="h-5 w-5 mr-2" />
                Explorar Empresas
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold bg-white/10 text-white border-white/30 backdrop-blur-md hover:bg-white/20 hover:scale-105 transition-transform"
              >
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar Indústria
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-2 text-white/70 text-sm">
            <span>Potencializado por</span>
            <div className="bg-white/90 p-1.5 rounded-md">
              <LogoSeict className="h-6 w-auto" />
            </div>
          </div>
        </div>

        {/* Floating elements for visual depth */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center text-white/40">
          <span className="text-xs font-medium uppercase tracking-widest mb-2">Scroll</span>
          <div className="w-0.5 h-10 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
        </div>
      </section>

      {/* Stats Section - Floated over hero transition */}
      <section className="relative z-20 -mt-16 mb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-primary/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8 text-center bg-white/50 hover:bg-white transition-colors duration-300">
              <div className="text-4xl md:text-5xl font-display font-black text-primary mb-1">{stats.totalEmpresas}+</div>
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Indústrias Ativas</div>
            </div>
            <div className="p-8 text-center bg-white/50 hover:bg-white transition-colors duration-300">
              <div className="text-4xl md:text-5xl font-display font-black text-primary mb-1">{stats.totalProdutos}+</div>
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Produtos Regionais</div>
            </div>
            <div className="p-8 text-center bg-white/50 hover:bg-white transition-colors duration-300">
              <div className="text-4xl md:text-5xl font-display font-black text-primary mb-1">{stats.totalMunicipios}</div>
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Municípios do Acre</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl font-display font-extrabold text-foreground mb-4">Empresas em Destaque</h2>
              <p className="text-muted-foreground">Conheça algumas das principais indústrias que impulsionam o crescimento econômico do nosso estado.</p>
            </div>
            <Link href="/buscar">
              <Button variant="link" className="text-primary font-bold group">
                Ver todas as empresas <Plus className="ml-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              </Button>
            </Link>
          </div>

          {errorMsg && (
            <div className="mb-8 p-6 glass border-red-200 bg-red-50/50 rounded-xl">
              <h4 className="font-bold text-red-800 flex items-center mb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                Erro ao sincronizar dados
              </h4>
              <p className="text-red-600 text-sm leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <HomeCompanyGrid empresas={empresas} />
        </div>
      </section>
    </div>
  )
}