"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buscarEmpresas } from "@/lib/database"
import type { Empresa } from "@/lib/supabase.types"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const { loading: authLoading } = useAuth()
  
  const initialSearchTerm = searchParams.get("busca") || ""
  const initialStatus = searchParams.get("status") || "ativo"
  const initialSector = searchParams.get("setor_economico") || "all"
  const initialCity = searchParams.get("municipio") || "all"

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [selectedStatus] = useState(initialStatus)
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
      const fetchedEmpresas = await buscarEmpresas({
        status: selectedStatus === "all" ? undefined : selectedStatus,
        setor_economico: selectedSector === "all" ? undefined : selectedSector,
        municipio: selectedCity === "all" ? undefined : selectedCity,
        busca: searchTerm,
      })
      setEmpresas(fetchedEmpresas)
    } catch (error) {
      console.error("Erro ao buscar empresas:", error)
      setEmpresas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [selectedStatus, selectedSector, selectedCity, searchTerm])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Search and Filters Section */}
      <section className="py-12 px-4 glass mx-4 rounded-3xl mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-black text-gray-900 mb-6 flex items-center justify-center">
            <Search className="mr-3 h-8 w-8 text-primary" />
            Encontre Indústrias e Produtos
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">Filtre por setor ou município para encontrar exatamente o que você procura.</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Nome da empresa ou produto..."
                  className="pl-12 h-14 rounded-2xl border-primary/10 shadow-sm focus:ring-primary/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-14 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20" onClick={fetchEmpresas}>
                Pesquisar
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Setor Econômico</label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-56 h-12 rounded-xl border-primary/10 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="Todos os Setores" />
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
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Localização (Município)</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-56 h-12 rounded-xl border-primary/10 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="Todos os Municípios" />
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
        </div>
      </section>

      {/* Company Listings */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-bold text-gray-900">
              {loading ? "Buscando..." : `${empresas.length} Resultados Encontrados`}
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
              <span className="text-muted-foreground font-medium">Sincronizando com a base de dados...</span>
            </div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[2rem] border-dashed border-2 border-muted">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-muted-foreground opacity-30" />
              </div>
              <h4 className="text-xl font-bold mb-2">Sem resultados para sua busca</h4>
              <p className="text-muted-foreground">Tente remover alguns filtros ou buscar por termos mais genéricos.</p>
              <Button variant="link" onClick={() => { setSearchTerm(""); }} className="mt-4 text-primary">
                Limpar Busca
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {empresas.map((empresa) => (
                <Card key={empresa.id} className="group overflow-hidden border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white rounded-2xl">
                  <CardHeader className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 relative flex-shrink-0 bg-white rounded-xl border border-border/30 overflow-hidden group-hover:scale-105 transition-transform">
                        {empresa.logo_url ? (
                          <img
                            src={empresa.logo_url}
                            alt={`Logo da ${empresa.nome_fantasia}`}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/30">
                            <span className="text-lg font-black text-muted-foreground/30">{empresa.nome_fantasia?.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                          {empresa.nome_fantasia || empresa.nome}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-tighter text-muted-foreground">
                          {empresa.setor_economico}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                    <div className="flex items-center text-sm font-medium text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {empresa.municipio}, AC
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed grow">
                      {empresa.apresentacao || "Esta indústria contribui para a economia local oferecendo serviços de alta qualidade."}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {empresa.segmento && (
                        <Badge variant="outline" className="text-[10px] h-5 border-primary/20 text-primary bg-primary/5">
                          {empresa.segmento}
                        </Badge>
                      )}
                      {empresa.tema_segmento && (
                        <Badge variant="outline" className="text-[10px] h-5 border-muted text-muted-foreground uppercase tracking-widest">
                          {empresa.tema_segmento}
                        </Badge>
                      )}
                    </div>
                    
                    <Link href={`/empresas/${empresa.id}`}>
                      <Button className="w-full bg-muted hover:bg-primary text-foreground hover:text-white border-none shadow-none font-bold transition-all">
                        Detalhes da Empresa
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
