import { Search, MapPin, Plus } from "lucide-react"
import {  BrasaoAcre } from "@/components/LogoIndustria"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isLoggedIn, getCurrentUser, logout } from "@/lib/auth" // Importa Server Actions e funções de auth
import { getLastCompanies } from "@/lib/empresa" // Importe sua função de busca

// Força renderização dinâmica devido ao uso de cookies
export const dynamic = 'force-dynamic'
// Força Node.js runtime para compatibilidade total com Supabase
export const runtime = 'nodejs'

export default async function HomePage() {
  const loggedIn = await isLoggedIn()
  const user = await getCurrentUser()
  const dashboardLink = user?.tipo === "admin" ? "/admin" : "/dashboard"

  // Debug para Vercel - vamos ver o que está acontecendo
  // console.log('🔍 Homepage Debug:', {
  //   nodeEnv: process.env.NODE_ENV,
  //   hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  //   hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  //   isVercel: !!process.env.VERCEL,
  //   timestamp: new Date().toISOString()
  // })

  // Busque as últimas 6 empresas cadastradas
  let empresas = []
  let errorMsg = null
  
  try {
    empresas = await getLastCompanies(6)
    console.log('✅ Empresas carregadas:', empresas.length)
  } catch (error) {
    console.error('❌ Erro ao carregar empresas:', error)
    errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
    empresas = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 from-10% to-green-600 to-90%">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BrasaoAcre  className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-bold text-slate-50">Portfólio das Indústrias do Acre</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/buscar" className="text-slate-50 hover:text-gray-900">
                Buscar Empresas
              </Link>
              {loggedIn ? (
                <>
                  <span className="text-slate-50 text-sm hidden sm:inline">Olá, {user?.email}</span>
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
                    <Button variant="outline">Entrar</Button>
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

          {/* Debug info para Vercel */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded">
              <h4 className="font-bold">Debug Info:</h4>
              <p>Environment: {process.env.NODE_ENV}</p>
              <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}</p>
              <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado'}</p>
              <p>Empresas encontradas: {empresas.length}</p>
              {errorMsg && <p className="text-red-600">Erro: {errorMsg}</p>}
            </div>
          )}

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
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{empresa.nome_fantasia || empresa.nome || "Nome não disponível"}</CardTitle>
                        <CardDescription>{empresa.razao_social || "Razão social não informada"}</CardDescription>
                      </div>
                      <Badge variant="secondary">{empresa.setor_economico || "Setor"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      {empresa.apresentacao || "Empresa cadastrada na plataforma."}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {empresa.municipio || "Acre"}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {empresa.instagram && (
                        <Badge variant="outline" className="text-xs">
                          {empresa.instagram}
                        </Badge>
                      )}
                    </div>
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
              <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
              <div className="text-gray-600">Empresas Cadastradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Produtos Registrados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">22</div>
              <div className="text-gray-600">Municípios Atendidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-900 from-10% to-green-600 to-90% text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BrasaoAcre className="h-6 w-6" />
                <span className="font-bold">Governo do Estado do Acre</span>
              </div>
              <p className="text-sm text-slate-50">
                Plataforma oficial para o desenvolvimento industrial do Estado do Acre.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresas</h4>
              <ul className="space-y-2 text-sm text-slate-50">
                <li>
                  <Link href="/cadastro">Cadastrar Empresa</Link>
                </li>
                <li>
                  <Link href="/dashboard">Área da Empresa</Link>
                </li>
                <li>
                  <Link href="/buscar">Buscar Empresas</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Setores</h4>
              <ul className="space-y-2 text-sm text-slate-50">
                <li>Alimentos</li>
                <li>Madeira</li>
                <li>Construção</li>
                <li>Agropecuária</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <p className="text-sm text-slate-50">
                Governo do Estado do Acre
                <br />
                SECRETARIA DE ESTADO DE INDUSTRIA, CIÊNCIA E TECNOLOGIA
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-slate-50">
            © 2025 Governo do Estado do Acre. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
