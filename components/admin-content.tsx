"use client" // Este é um Client Component

import { useState, useEffect } from "react"
import Link from "next/link"
import { Factory, Package, Plus, Eye, CheckCircle, Clock, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { obterEstatisticasAdmin, buscarEmpresasAdmin, atualizarStatusEmpresa } from "@/lib/admin"
import type { Empresa } from "@/lib/supabase.types"
import { formatBrazilianShortDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface AdminContentProps {
  initialStats: {
    totalEmpresas: number
    empresasAtivas: number
    empresasPendentes: number
    empresasInativas: number
    novosCadastrosMes: number
    totalProdutos: number
    visualizacoesTotais: number
  }
  initialEmpresas: Empresa[]
  isConfiguredProp: boolean
}

export function AdminContent({ initialStats, initialEmpresas, isConfiguredProp }: AdminContentProps) {
  const [stats, setStats] = useState(initialStats)
  const [empresas, setEmpresas] = useState(initialEmpresas)
  const [loading, setLoading] = useState(false) // Este loading é para buscas client-side
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSector, setSelectedSector] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")

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

  useEffect(() => {
    const loadFilteredData = async () => {
      setLoading(true)
      try {
        const empresasData = await buscarEmpresasAdmin({
          status: selectedStatus === "all" ? undefined : selectedStatus,
          setor_economico: selectedSector === "all" ? undefined : selectedSector,
          municipio: selectedCity === "all" ? undefined : selectedCity,
          busca: searchTerm,
        })
        setEmpresas(empresasData)
      } catch (err) {
        console.error("Erro ao carregar dados do admin:", err)
      } finally {
        setLoading(false)
      }
    }
    loadFilteredData()
  }, [selectedStatus, selectedSector, selectedCity, searchTerm])

  const handleStatusChange = async (empresaId: string, newStatus: "ativo" | "pendente" | "inativo") => {
    setLoading(true)
    try {
      await atualizarStatusEmpresa(empresaId, newStatus)
      // Re-busca todos os dados após a mudança de status
      const [updatedStats, updatedEmpresas] = await Promise.all([
        obterEstatisticasAdmin(),
        buscarEmpresasAdmin({
          status: selectedStatus === "all" ? undefined : selectedStatus,
          setor_economico: selectedSector === "all" ? undefined : selectedSector,
          municipio: selectedCity === "all" ? undefined : selectedCity,
          busca: searchTerm,
        }),
      ])
      setStats(updatedStats)
      setEmpresas(updatedEmpresas)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      alert("Erro ao atualizar status da empresa.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ativo":
        return "default"
      case "pendente":
        return "secondary"
      case "inativo":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <>
      {!isConfiguredProp && (
        <div className="bg-yellow-100 border-yellow-500 text-yellow-700 px-4 py-3" role="alert">
          <strong className="font-bold">Atenção:</strong>
          <span className="block sm:inline">
            Banco de dados não configurado. O painel administrativo funcionará em modo de demonstração.
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalEmpresas}</div>
              <p className="text-xs text-muted-foreground">
                +{loading ? "..." : stats.novosCadastrosMes} novos este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.empresasAtivas}</div>
              <p className="text-xs text-muted-foreground">Perfis aprovados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.empresasPendentes}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalProdutos}</div>
              <p className="text-xs text-muted-foreground">Em toda a plataforma</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="empresas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="produtos" disabled>
              Produtos (Em Breve)
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics (Em Breve)
            </TabsTrigger>
            <TabsTrigger value="usuarios" disabled>
              Usuários (Em Breve)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="empresas">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciamento de Empresas</CardTitle>
                    <CardDescription>Visualize e gerencie as empresas cadastradas.</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Buscar por nome, CNPJ, razão social..."
                      className="pl-10 pr-4 py-2 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger className="w-full sm:w-[200px]">
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
                    <SelectTrigger className="w-full sm:w-[200px]">
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
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Carregando empresas...</div>
                ) : empresas.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">Nenhuma empresa encontrada.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome Fantasia</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Município</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cadastro</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresas.map((empresa) => (
                        <TableRow key={empresa.id}>
                          <TableCell className="font-medium">{empresa.nome_fantasia}</TableCell>
                          <TableCell>{empresa.cnpj}</TableCell>
                          <TableCell>{empresa.municipio}</TableCell>
                          <TableCell>{empresa.setor_empresa}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(empresa.status)}>
                              {empresa.status.charAt(0).toUpperCase() + empresa.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatBrazilianShortDate(empresa.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/empresas/${empresa.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuCheckboxItem
                                        checked={empresa.status === "ativo"}
                                        onCheckedChange={() => {}}
                                        disabled={empresa.status === "ativo"}
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Ativar
                                      </DropdownMenuCheckboxItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Ativação</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja ativar a empresa "{empresa.nome_fantasia}"? Ela ficará
                                          visível publicamente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleStatusChange(empresa.id, "ativo")}>
                                          Confirmar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuCheckboxItem
                                        checked={empresa.status === "pendente"}
                                        onCheckedChange={() => {}}
                                        disabled={empresa.status === "pendente"}
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Marcar como Pendente
                                      </DropdownMenuCheckboxItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Pendência</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja marcar a empresa "{empresa.nome_fantasia}" como
                                          pendente? Ela não ficará visível publicamente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleStatusChange(empresa.id, "pendente")}>
                                          Confirmar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuCheckboxItem
                                        checked={empresa.status === "inativo"}
                                        onCheckedChange={() => {}}
                                        disabled={empresa.status === "inativo"}
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Inativar
                                      </DropdownMenuCheckboxItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Inativação</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja inativar a empresa "{empresa.nome_fantasia}"? Ela não
                                          ficará visível publicamente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleStatusChange(empresa.id, "inativo")}>
                                          Confirmar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
