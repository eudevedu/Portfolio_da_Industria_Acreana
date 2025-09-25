"use client"

import { useState, useEffect } from "react"
import { Search, Building2, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buscarEmpresas } from "@/lib/database"
import type { Empresa } from "@/lib/supabase.types" // Importa o tipo do novo arquivo
import { useSearchParams } from "next/navigation"
import { LogoSeict } from "@/components/LogoIndustria"
import { SafeImage } from "@/components/SafeImage"
import { useAuth } from "@/hooks/use-auth"
import { logout } from "@/lib/auth"
import Footer from "@/components/footer"

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const { user, loading: authLoading, isLoggedIn } = useAuth()
  
  const initialSearchTerm = searchParams.get("busca") || ""
  const initialStatus = searchParams.get("status") || "ativo" // Default to active companies
  const initialSector = searchParams.get("setor_economico") || "all"
  const initialCity = searchParams.get("municipio") || "all"

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [selectedSector, setSelectedSector] = useState(initialSector)
  const [selectedCity, setSelectedCity] = useState(initialCity)

  const setoresEconomicos = [
    { value: "industria", label: "Indústria" },
    { value: "agroindustria", label: "Agroindústria" },
    { value: "servicos", label: "Serviços" },
    { value: "comercio", label: "Comércio" },
  ]

  const municipios = [
    { value: "Rio Branco", label: "Rio Branco" },
    { value: "Cruzeiro do Sul", label: "Cruzeiro do Sul" },
    { value: "Sena Madureira", label: "Sena Madureira" },
    { value: "Feijo", label: "Feijó" },
    { value: "Tarauaca", label: "Tarauacá" },
    { value: "Brasileia", label: "Brasiléia" },
    { value: "Xapuri", label: "Xapuri" },
    { value: "Senador Guiomard", label: "Senador Guiomard" },
    { value: "Placido de Castro", label: "Plácido de Castro" },
    { value: "Manoel Urbano", label: "Manoel Urbano" },
    { value: "Assis Brasil", label: "Assis Brasil" },
    { value: "Capixaba", label: "Capixaba" },
    { value: "Porto Acre", label: "Porto Acre" },
    { value: "Rodrigues Alves", label: "Rodrigues Alves" },
    { value: "Marechal Thaumaturgo", label: "Marechal Thaumaturgo" },
    { value: "Porto Walter", label: "Porto Walter" },
    { value: "Santa Rosa do Purus", label: "Santa Rosa do Purus" },
    { value: "Jordao", label: "Jordão" },
    { value: "Acrelandia", label: "Acrelândia" },
    { value: "Bujari", label: "Bujari" },
    { value: "Epitaciolandia", label: "Epitaciolândia" },
    { value: "Mancio Lima", label: "Mâncio Lima" },
  ]

  const fetchEmpresas = async () => {
    setLoading(true)
    try {
      console.log('🔍 Frontend - Buscando empresas com filtros:', {
        status: selectedStatus,
        setor_economico: selectedSector,
        municipio: selectedCity,
        busca: searchTerm
      })

      const fetchedEmpresas = await buscarEmpresas({
        status: selectedStatus === "all" ? undefined : selectedStatus,
        setor_economico: selectedSector === "all" ? undefined : selectedSector,
        municipio: selectedCity === "all" ? undefined : selectedCity,
        busca: searchTerm,
      })
      
      console.log('✅ Frontend - Empresas encontradas:', fetchedEmpresas.length)
      setEmpresas(fetchedEmpresas)
    } catch (error) {
      console.error("❌ Frontend - Erro ao buscar empresas:", error)
      setEmpresas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [selectedStatus, selectedSector, selectedCity, searchTerm])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 from-10% to-green-600 to-90% shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <LogoSeict className="h-14 w-14 " />
              </Link>
              <h1 className="text-xl font-bold text-slate-50">Indústrias do Acre</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/buscar" className="text-slate-50 hover:text-gray-900">
                Buscar Empresas
              </Link>
              <Link href="/" className="text-slate-50 hover:text-gray-900">
                Início
              </Link>
              {!authLoading && (
                <>
                  {isLoggedIn ? (
                    <>
                      <span className="text-slate-50 text-sm hidden sm:inline">
                        Olá, {user?.email}
                      </span>
                      <Link href={user?.tipo === "admin" ? "/admin" : "/dashboard"}>
                        <Button variant="outline">Meu Painel</Button>
                      </Link>
                      <form action={logout} method="post" className="inline">
                        <Button type="submit" variant="ghost" className="text-slate-50">
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
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Search and Filters Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Encontre Indústrias e Produtos</h2>
          <p className="text-lg text-gray-700 mb-8">Utilize os filtros abaixo para refinar sua busca.</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa, produto ou setor..."
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-12" onClick={fetchEmpresas}>
                Buscar
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Setor Econômico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Setores</SelectItem>
                {setoresEconomicos.map((sector) => (
                  <SelectItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Município" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Municípios</SelectItem>
                {municipios.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Company Listings */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Resultados da Busca</h3>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-3 text-lg text-gray-700">Carregando empresas...</span>
            </div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-lg">
              Nenhuma empresa encontrada com os critérios selecionados.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {empresas.map((empresa) => (
                    <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        {empresa.logo_url && (
                          <img
                            src={empresa.logo_url}
                            alt={`Logo da ${empresa.nome_fantasia}`}
                            className="w-12 h-12 object-contain rounded bg-white border"
                          />
                        )}
                        
                        <div className="flex-1">
                          <CardTitle className="text-lg">{empresa.nome_fantasia}</CardTitle>
                          <CardDescription>{empresa.razao_social}</CardDescription>
                        </div>
                        <Badge variant="secondary">{empresa.setor_empresa}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                          {empresa.apresentacao || "Nenhuma apresentação disponível."}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {empresa.municipio}, AC
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {empresa.descricao_produtos?.split(",").map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Link href={`/empresas/${empresa.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

           <div className="mt-auto">
                <Footer/>
            </div>
          </div>
        )
      }
