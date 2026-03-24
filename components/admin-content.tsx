"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Factory, 
  Package, 
  Plus, 
  Eye, 
  CheckCircle, 
  Clock, 
  Search, 
  ChevronDown, 
  Loader2, 
  UserPlus, 
  Edit, 
  Key, 
  UserX, 
  UserCheck, 
  Trash2, 
  Building2,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  LogOut,
  Users,
  ExternalLink,
  BarChart3,
  X,
  Printer,
  Share2,
  ListFilter
} from "lucide-react"
import { IndustrialDetailsModal } from "@/components/IndustrialDetailsModal"
import { ConfiguracoesModal } from "@/components/ConfiguracoesModal"
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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  obterEstatisticasAdmin, 
  buscarEmpresasAdmin, 
  atualizarStatusEmpresa, 
  obterTodosAdmins, 
  atualizarStatusAdmin,
  atualizarEmpresa,
  excluirEmpresa 
} from "@/lib/admin"
import { criarEmpresa } from "@/lib/database"
import { logout } from "@/lib/auth"
import type { Empresa, Admin } from "@/lib/supabase.types"
import { formatBrazilianShortDate, cn } from "@/lib/utils"
import { LogoSeict } from "@/components/LogoIndustria"

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
  user: any
}

export function AdminContent({ initialStats, initialEmpresas, isConfiguredProp, user }: AdminContentProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState(initialStats)
  const [empresas, setEmpresas] = useState(initialEmpresas)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSector, setSelectedSector] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")

  // Estados para modais
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creatingEmpresa, setCreatingEmpresa] = useState(false)
  const [novaEmpresa, setNovaEmpresa] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    setor_economico: "",
    setor_empresa: "",
    segmento: "",
    tema_segmento: "",
    municipio: "",
    endereco: "",
    apresentacao: "",
    descricao_produtos: "",
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    twitter: "",
    video_apresentacao: ""
  })

  const [showEditCompanyDialog, setShowEditCompanyDialog] = useState(false)
  const [updatingCompany, setUpdatingCompany] = useState(false)
  const [companyToEdit, setCompanyToEdit] = useState<Empresa | null>(null)

  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [companyToView, setCompanyToView] = useState<Empresa | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [novoAdmin, setNovoAdmin] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    cargo: ""
  })

  const [showEditAdminDialog, setShowEditAdminDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(false)
  const [adminToEdit, setAdminToEdit] = useState<Admin | null>(null)

  const municipios = [
    { value: "Rio Branco", label: "Rio Branco" },
    { value: "Cruzeiro do Sul", label: "Cruzeiro do Sul" },
    { value: "Sena Madureira", label: "Sena Madureira" },
    { value: "Feijo", label: "Feijó" },
    { value: "Tarauaca", label: "Tarauacá" },
    { value: "Brasileia", label: "Brasiléia" },
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

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const adminsData = await obterTodosAdmins()
        setAdmins(adminsData)
      } catch (err) {
        console.error("Erro ao carregar administradores:", err)
      }
    }
    loadAdmins()
  }, [])

  const handleCreateEmpresa = async () => {
    if (!novaEmpresa.email || !novaEmpresa.password || !novaEmpresa.nome_fantasia) {
      alert("Preencha os campos obrigatórios")
      return
    }
    setCreatingEmpresa(true)
    try {
      const result = await criarEmpresa({...novaEmpresa})
      if (result) {
        const updatedStats = await obterEstatisticasAdmin()
        setStats(updatedStats)
        setEmpresas(prev => [result, ...prev])
        setShowCreateDialog(false)
        alert("Empresa criada!")
      }
    } finally {
      setCreatingEmpresa(false)
    }
  }

  const handleUpdateCompany = async () => {
    if (!companyToEdit) return
    setUpdatingCompany(true)
    try {
      const result = await atualizarEmpresa(companyToEdit.id, companyToEdit)
      if (result) {
        setEmpresas(prev => prev.map(e => e.id === result.id ? result : e))
        setShowEditCompanyDialog(false)
        alert("Dados da empresa atualizados com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error)
      alert("Erro ao atualizar dados da empresa")
    } finally {
      setUpdatingCompany(false)
    }
  }

  const handleEditCompany = (empresa: Empresa) => {
    setCompanyToEdit({ ...empresa })
    setShowEditCompanyDialog(true)
  }

  const handleViewDetails = (empresa: Empresa) => {
    setCompanyToView(empresa)
    setShowDetailsDialog(true)
  }

  const handleDeleteCompany = async (empresa: Empresa) => {
    if (!confirm(`Excluir permanentemente "${empresa.nome_fantasia}"?`)) return
    try {
      const success = await excluirEmpresa(empresa.id)
      if (success) {
        setEmpresas(prev => prev.filter(e => e.id !== empresa.id))
        const updatedStats = await obterEstatisticasAdmin()
        setStats(updatedStats)
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
    }
  }

  const handleStatusChange = async (empresaId: string, newStatus: "ativo" | "pendente" | "inativo") => {
    try {
      await atualizarStatusEmpresa(empresaId, newStatus)
      const empresasData = await buscarEmpresasAdmin({
        status: selectedStatus === "all" ? undefined : selectedStatus,
        busca: searchTerm,
      })
      setEmpresas(empresasData)
      const updatedStats = await obterEstatisticasAdmin()
      setStats(updatedStats)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
        {/* Sidebar Navigation - Mirroring Dashboard */}
        <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
          <div className="p-8 border-b border-slate-100">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="p-2 bg-green-600 rounded-xl shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform">
                <LogoSeict className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-black leading-none text-slate-900 uppercase">ADMIN</span>
                <span className="text-[0.6rem] font-bold tracking-[0.2em] text-green-600 uppercase leading-none mt-1">Portal da Indústria</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-6 space-y-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4 px-3">Gestão de Plataforma</p>
            <TabsList className="flex flex-col w-full bg-transparent p-0 gap-2 h-auto">
              {[
                { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
                { id: 'empresas', label: 'Gestão de Empresas', icon: Building2 },
                { id: 'administradores', label: 'Equipe Admin', icon: Users },
              ].map((item) => (
                <TabsTrigger 
                  key={item.id} 
                  value={item.id}
                  className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-slate-600 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-slate-50 transition-all font-medium border-transparent"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="pt-8 space-y-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4 px-3">Atalhos</p>
              <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium group">
                <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                <span>Ver Site Público</span>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowSettingsModal(true)}
                className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium group text-left"
              >
                <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
                <span>Configurações</span>
              </Button>
            </div>
          </nav>

          <div className="p-6 border-t border-slate-100">
            <form action={logout}>
              <Button type="submit" variant="ghost" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-bold">
                <LogOut className="h-5 w-5" />
                Sair do Sistema
              </Button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
          {/* Header Area */}
          <header className="bg-gradient-to-r from-green-900 to-green-700 h-24 sticky top-0 z-30 px-8 flex items-center justify-between shadow-lg">
            <div>
              <h1 className="text-2xl font-display font-black tracking-tight text-white uppercase">
                {activeTab === 'dashboard' ? 'Painel de Controle' : activeTab === 'empresas' ? 'Indústrias' : 'Administradores'}
              </h1>
              <p className="text-sm text-green-50/80 font-medium">Gestão centralizada do Portfólio Industrial</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-white leading-tight">{user?.nome || user?.email?.split('@')[0]}</span>
                <span className="text-[10px] font-bold text-green-100/70 uppercase tracking-tighter leading-none mb-1">Administrador</span>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-extrabold bg-white/10 text-white border-white/20 flex items-center gap-1 h-5 px-2">
                  <ShieldCheck className="h-3 w-3" />
                  Sistema Seguro
                </Badge>
              </div>
              <div className="w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center text-green-900 font-black text-xs border-2 border-green-500/20">
                AD
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-[1600px] mx-auto w-full">
            {!isConfiguredProp && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 text-amber-800">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-bold">Modo de demonstração ativado. Configurações de banco de dados pendentes.</p>
              </div>
            )}

            {/* Dashboard View */}
            <TabsContent value="dashboard" className="mt-0 outline-none space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Empresas" value={stats.totalEmpresas} icon={<Factory className="h-5 w-5" />} trend="+3 este mês" />
                <StatCard label="Ativas" value={stats.empresasAtivas} icon={<CheckCircle className="h-5 w-5 text-green-600" />} color="green" />
                <StatCard label="Pendentes" value={stats.empresasPendentes} icon={<Clock className="h-5 w-5 text-amber-600" />} color="amber" />
                <StatCard label="Visualizações" value={stats.visualizacoesTotais} icon={<BarChart3 className="h-5 w-5 text-blue-600" />} color="blue" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 glass rounded-[2rem] border-white/40 shadow-xl overflow-hidden">
                   <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <CardTitle className="font-display font-black text-slate-900">Indústrias Recentes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader><TableRow><TableHead className="pl-6">Empresa</TableHead><TableHead>Status</TableHead><TableHead className="text-right pr-6">Ações</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {empresas.slice(0, 5).map(e => (
                          <TableRow key={e.id}>
                            <TableCell className="pl-6 py-4 font-bold text-slate-800">{e.nome_fantasia}</TableCell>
                            <TableCell><Badge className="rounded-full">{e.status}</Badge></TableCell>
                            <TableCell className="text-right pr-6 space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400" onClick={() => handleViewDetails(e)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400" onClick={() => handleEditCompany(e)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="glass rounded-[2rem] border-white/40 shadow-xl overflow-hidden">
                   <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <CardTitle className="font-display font-black text-slate-900">Atividade</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-bold text-green-900">Nova empresa aprovada agora</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">Sincronização concluída</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Empresas View */}
            <TabsContent value="empresas" className="mt-0 outline-none space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex-1 w-full space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pesquisar Base de Dados</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Nome da empresa, CNPJ, responsável..." className="pl-10 rounded-xl h-11 border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="rounded-xl bg-primary h-11 font-bold px-6 shadow-lg shadow-primary/20"><Plus className="h-4 w-4 mr-2" /> Nova Indústria</Button>
              </div>

              <Card className="rounded-[2rem] overflow-hidden border-slate-200 shadow-2xl shadow-slate-200/50">
                <CardHeader className="bg-white border-b px-8 py-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display font-black text-slate-900">Listagem Completa</CardTitle>
                    <CardDescription>Gerencie todas as empresas cadastradas no portal</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40 rounded-xl h-10"><SelectValue placeholder="Filtrar Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="pl-8 h-12">Indústria</TableHead>
                        <TableHead className="h-12">Setor</TableHead>
                        <TableHead className="h-12">Status</TableHead>
                        <TableHead className="h-12 text-right pr-8">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresas.map((empresa) => (
                        <TableRow key={empresa.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{empresa.nome_fantasia}</span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{empresa.municipio}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-600">{empresa.setor_economico}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              empresa.status === 'ativo' ? 'bg-green-50 text-green-700 border-green-100' : 
                              empresa.status === 'pendente' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                              'bg-slate-50 text-slate-700 border-slate-100'
                            }`}>
                              {empresa.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-xl"><ChevronDown className="h-4 w-4 text-slate-400" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl p-2">
                                 <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer" onClick={() => handleViewDetails(empresa)}>
                                   <Eye className="h-4 w-4" /> Visualizar Detalhes
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer" onClick={() => handleEditCompany(empresa)}>
                                   <Edit className="h-4 w-4" /> Editar Perfil
                                 </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-[0.6rem] uppercase tracking-[0.2em] opacity-50 px-2 py-2">Alterar Status</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem className="rounded-lg" checked={empresa.status === 'ativo'} onCheckedChange={() => handleStatusChange(empresa.id, 'ativo')}>Ativo</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem className="rounded-lg" checked={empresa.status === 'pendente'} onCheckedChange={() => handleStatusChange(empresa.id, 'pendente')}>Pendente</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem className="rounded-lg" checked={empresa.status === 'inativo'} onCheckedChange={() => handleStatusChange(empresa.id, 'inativo')}>Inativo</DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => handleDeleteCompany(empresa)}><Trash2 className="h-4 w-4" /> Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Administradores View */}
            <TabsContent value="administradores" className="mt-0 outline-none space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Equipe Técnica Aleac</h2>
                  <Button onClick={() => setShowCreateAdminDialog(true)} className="bg-slate-900 rounded-xl font-bold"><UserPlus className="h-4 w-4 mr-2" /> Novo Administrador</Button>
               </div>
               
               <Card className="rounded-[2rem] overflow-hidden border-slate-200 shadow-xl">
                 <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="pl-8">Nome</TableHead><TableHead>Acesso</TableHead><TableHead>Status</TableHead><TableHead className="text-right pr-8">Ações</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {admins.map(admin => (
                          <TableRow key={admin.id}>
                            <TableCell className="pl-8 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{admin.nome}</span>
                                <span className="text-xs text-slate-400">{admin.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium uppercase tracking-widest text-slate-500">{admin.cargo || 'Gestor'}</TableCell>
                            <TableCell><Badge className="rounded-full">{admin.ativo ? 'Conectado' : 'Bloqueado'}</Badge></TableCell>
                            <TableCell className="text-right pr-8 space-x-2">
                              <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => { setAdminToEdit(admin); setShowEditAdminDialog(true); }}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                 </CardContent>
               </Card>
            </TabsContent>
          </main>
        </div>
      </Tabs>

      {/* Reusing existing Dialogs with updated styling */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">Cadastrar Nova Indústria</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 py-6">
            <div className="space-y-4">
               <div><Label className="text-xs font-black uppercase text-slate-400">E-mail de Acesso *</Label><Input className="rounded-xl mt-1.5" value={novaEmpresa.email} onChange={e => setNovaEmpresa({...novaEmpresa, email: e.target.value})} /></div>
               <div><Label className="text-xs font-black uppercase text-slate-400">Senha Padrão *</Label><Input type="password" className="rounded-xl mt-1.5" value={novaEmpresa.password} onChange={e => setNovaEmpresa({...novaEmpresa, password: e.target.value})} /></div>
               <div><Label className="text-xs font-black uppercase text-slate-400">Nome Fantasia *</Label><Input className="rounded-xl mt-1.5" value={novaEmpresa.nome_fantasia} onChange={e => setNovaEmpresa({...novaEmpresa, nome_fantasia: e.target.value})} /></div>
            </div>
            <div className="space-y-4">
               <div><Label className="text-xs font-black uppercase text-slate-400">Município Sede *</Label>
                <Select value={novaEmpresa.municipio} onValueChange={v => setNovaEmpresa({...novaEmpresa, municipio: v})}>
                  <SelectTrigger className="rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{municipios.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select></div>
               <div><Label className="text-xs font-black uppercase text-slate-400">Apresentação Breve *</Label><Textarea className="rounded-xl mt-1.5 min-h-[100px]" value={novaEmpresa.apresentacao} onChange={e => setNovaEmpresa({...novaEmpresa, apresentacao: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter className="pt-4"><Button onClick={handleCreateEmpresa} className="w-full md:w-auto rounded-xl bg-slate-900 h-11 px-8 font-bold">{creatingEmpresa ? "Sincronizando..." : "Concluir Cadastro"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Company Dialog */}
      <Dialog open={showEditCompanyDialog} onOpenChange={setShowEditCompanyDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Edit className="h-6 w-6 text-primary" />
              Editar Perfil Industrial
            </DialogTitle>
          </DialogHeader>
          
          {companyToEdit && (
            <div className="grid md:grid-cols-2 gap-6 py-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400">Nome Fantasia</Label>
                  <Input 
                    className="rounded-xl" 
                    value={companyToEdit.nome_fantasia} 
                    onChange={e => setCompanyToEdit({ ...companyToEdit, nome_fantasia: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400">Razão Social</Label>
                  <Input 
                    className="rounded-xl" 
                    value={companyToEdit.razao_social || ""} 
                    onChange={e => setCompanyToEdit({ ...companyToEdit, razao_social: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400">CNPJ</Label>
                  <Input 
                    className="rounded-xl" 
                    value={companyToEdit.cnpj || ""} 
                    onChange={e => setCompanyToEdit({ ...companyToEdit, cnpj: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400">Setor Econômico</Label>
                  <Input 
                    className="rounded-xl" 
                    value={companyToEdit.setor_economico || ""} 
                    onChange={e => setCompanyToEdit({ ...companyToEdit, setor_economico: e.target.value })} 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400">Município</Label>
                  <Select 
                    value={companyToEdit.municipio} 
                    onValueChange={v => setCompanyToEdit({ ...companyToEdit, municipio: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione o município" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipios.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400">Apresentação</Label>
                  <Textarea 
                    className="rounded-xl min-h-[120px] resize-none" 
                    value={companyToEdit.apresentacao || ""} 
                    onChange={e => setCompanyToEdit({ ...companyToEdit, apresentacao: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-400">Vídeo de Apresentação (URL)</Label>
                  <Input 
                    className="rounded-xl" 
                    placeholder="https://youtube.com/..."
                    value={companyToEdit.video_apresentacao || ""} 
                    onChange={e => setCompanyToEdit({ ...companyToEdit, video_apresentacao: e.target.value })} 
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowEditCompanyDialog(false)}
              className="rounded-xl h-12 px-8 font-bold"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateCompany} 
              disabled={updatingCompany}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 h-12 px-8 font-bold shadow-lg shadow-slate-900/20"
            >
              {updatingCompany ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando Alterações...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <IndustrialDetailsModal 
        isOpen={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)} 
        company={companyToView} 
      />

      <ConfiguracoesModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userEmail={user?.email || ""}
        userName={user?.nome}
        userType="admin"
        empresaId=""
      />
    </div>
  )
}

function StatCard({ label, value, icon, trend, color = "slate" }: { label: string, value: number, icon: React.ReactNode, trend?: string, color?: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-500/10 text-green-600",
    blue: "bg-blue-500/10 text-blue-600",
    amber: "bg-amber-500/10 text-amber-600",
    slate: "bg-slate-500/10 text-slate-600",
  }

  return (
    <Card className="glass shadow-xl shadow-slate-200/40 border-white/40 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</CardTitle>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${colorMap[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-display font-black text-slate-900 mb-1">{value}</div>
        {trend && <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{trend}</p>}
      </CardContent>
    </Card>
  )
}
