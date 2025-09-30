import { Search, MapPin, Plus } from "lucide-react"
import { LogoSeict } from "@/components/LogoIndustria"
import { SafeImage } from "@/components/SafeImage"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isLoggedIn, getCurrentUser, logout } from "@/lib/auth" // Importa Server Actions e funções de auth
import { getLastCompanies } from "@/lib/empresa" // Importe sua função de busca
import { obterEstatisticasHome } from "@/lib/database" // Importa função de estatísticas
import Footer from "@/components/footer"
import { Empresa } from "@/lib/supabase.types"

// Força renderização dinâmica devido ao uso de cookies
export const dynamic = 'force-dynamic'
// Força Node.js runtime para compatibilidade total com Supabase
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

    let empresa: Empresa | null = null

  // Busca estatísticas dinâmicas
  const stats = await obterEstatisticasHome()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 from-10% to-green-600 to-90%">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <LogoSeict className="h-14 w-14" />
              </Link>
              <h1 className="text-xl font-bold text-slate-50">Portfólio das Indústrias do Acre</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/buscar" className="text-slate-50 hover:text-gray-900">
                Buscar Empresas
              </Link>
              {loggedIn ? (
                <>
                  <span className="text-slate-50 text-sm hidden sm:inline">Olá, {empresa?.nome_fantasia || "Usuário"}!</span>
                  <Link href={dashboardLink}>
                    <Button variant="outline">Meu Painel</Button>
                  </Link>
                  <form action={logout}>
                    <Button type="submit" variant="outline">
                      Sair
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/cadastro">
                    <Button>Cadastrar Empresa</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 flex flex-col items-center justify-center bg-[url('/acre.jpg')] bg-no-repeat bg-center bg-cover">
        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-amber-900 bg-opacity-60"></div>
        <div className="relative max-w-2xl text-center z-10">
          <div className="flex items-center justify-center space-x-4 mb-6 ">
            {/* <LogoIndustria className="h-16 w-16 text-green-600" /> */}
            <h1 className="text-5xl font-extrabold text-slate-50 leading-tight">Portfólio das Indústrias Acreanas</h1>
          </div>
          <p className="text-xl text-slate-50 mb-8">
            Conectando o potencial industrial do Acre ao mundo. Encontre empresas, produtos e serviços da nossa região.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/buscar">
              <Button size="lg" className="px-8 py-3 text-lg">
                <Search className="h-5 w-5 mr-3" />
                Buscar Empresas e Produtos
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg border-green-600 text-green-700 hover:bg-green-100 hover:text-green-800 bg-slate-50"
              >
                <Plus className="h-5 w-5 mr-3" />
                Cadastre sua Empresa
              </Button>
            </Link>
          </div>
          <div className="mt-12 text-sm text-slate-50">
            <p>
              Já tem uma conta?{" "}
              <Link href="/login" className="text-green-600 hover:underline">
                Faça login aqui
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Empresas em Destaque</h3>

          {errorMsg && (
            <div className="mb-8 p-4 bg-red-100 border border-red-400 rounded">
              <h4 className="font-bold text-red-800">Erro ao carregar empresas:</h4>
              <p className="text-red-600">{errorMsg}</p>
              <p className="text-sm text-red-500 mt-2">
                Verifique se as variáveis de ambiente do Supabase estão configuradas corretamente.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresas.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">Nenhuma empresa encontrada.</p>
              </div>
            ) : (
              empresas.map((empresa) => (
                <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      {/* Logo da empresa */}
                      {empresa.logo_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={empresa.logo_url}
                            alt={`Logo da ${empresa.nome_fantasia}`}
                            className="w-12 h-12 object-contain rounded bg-white border"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <CardTitle className="text-lg">{empresa.nome_fantasia || empresa.nome || "Nome não disponível"}</CardTitle>
                        <CardDescription className="mb-2">{empresa.razao_social || "Razão social não informada"}</CardDescription>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{empresa.setor_economico || "Setor"}</Badge>
                          {empresa.setor_empresa && (
                            <Badge variant="outline">{empresa.setor_empresa}</Badge>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {empresa.apresentacao || empresa.descricao_produtos || "Empresa cadastrada na plataforma."}
                    </p>

                    {/* Localização */}
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      <span className="truncate">
                        {empresa.municipio || "Acre"}{empresa.endereco && `, ${empresa.endereco}`}
                      </span>
                    </div>

                    {/* Segmentos e temas */}
                    {(empresa.segmento || empresa.tema_segmento) && (
                      <div className="flex gap-1 flex-wrap mb-3">
                        {empresa.segmento && (
                          <Badge variant="outline" className="text-xs">
                            {empresa.segmento}
                          </Badge>
                        )}
                        {empresa.tema_segmento && (
                          <Badge variant="outline" className="text-xs">
                            {empresa.tema_segmento}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Redes sociais */}
                    {(empresa.instagram || empresa.facebook || empresa.linkedin) && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {empresa.instagram && (
                          <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700">
                            Instagram
                          </Badge>
                        )}
                        {empresa.facebook && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Facebook
                          </Badge>
                        )}
                        {empresa.linkedin && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                            LinkedIn
                          </Badge>
                        )}
                      </div>
                    )}

                    <Link href={`/empresas/${empresa.id}`} className="block mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver mais detalhes
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link href="/buscar">
              <Button variant="outline" size="lg">
                Ver Todas as Empresas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalEmpresas}+</div>
              <div className="text-gray-600">Empresas Cadastradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalProdutos}+</div>
              <div className="text-gray-600">Produtos Registrados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalMunicipios}</div>
              <div className="text-gray-600">Municípios Atendidos</div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer Section */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}