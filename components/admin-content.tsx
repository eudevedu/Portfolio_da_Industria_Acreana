"use client" // Este é um Client Component

import { useState, useEffect } from "react"
import Link from "next/link"
import { Factory, Package, Plus, Eye, CheckCircle, Clock, Search, ChevronDown, Loader2, UserPlus, Edit, Key, UserX, UserCheck, Trash2, Building2 } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { obterEstatisticasAdmin, buscarEmpresasAdmin, atualizarStatusEmpresa, obterTodosAdmins, atualizarStatusAdmin } from "@/lib/admin"
import { criarEmpresa } from "@/lib/database"
import type { Empresa, Admin } from "@/lib/supabase.types"
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
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(false) // Este loading é para buscas client-side
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSector, setSelectedSector] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")

  // Estados para o modal de cadastro de empresa
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creatingEmpresa, setCreatingEmpresa] = useState(false)
  const [novaEmpresa, setNovaEmpresa] = useState({
    // Dados de Acesso
    email: "",
    password: "",
    confirmPassword: "",
    // Dados da Empresa
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

  // Estados para o modal de cadastro de administrador
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [novoAdmin, setNovoAdmin] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    cargo: ""
  })

  // Estados para gerenciamento de administradores
  const [showEditAdminDialog, setShowEditAdminDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(false)
  const [adminToEdit, setAdminToEdit] = useState<Admin | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [resetingPassword, setResetingPassword] = useState(false)
  const [adminToResetPassword, setAdminToResetPassword] = useState<Admin | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

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

  // Carregar administradores
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
    // Validação dos campos obrigatórios
    if (!novaEmpresa.email || !novaEmpresa.password || !novaEmpresa.confirmPassword ||
        !novaEmpresa.nome_fantasia || !novaEmpresa.razao_social || !novaEmpresa.cnpj || 
        !novaEmpresa.setor_economico || !novaEmpresa.setor_empresa || 
        !novaEmpresa.descricao_produtos || !novaEmpresa.apresentacao || 
        !novaEmpresa.endereco || !novaEmpresa.municipio) {
      alert("Preencha todos os campos obrigatórios marcados com *")
      return
    }

    // Validação de confirmação de senha
    if (novaEmpresa.password !== novaEmpresa.confirmPassword) {
      alert("As senhas não coincidem")
      return
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(novaEmpresa.email)) {
      alert("Digite um email válido")
      return
    }

    setCreatingEmpresa(true)
    try {
      const empresaData = {
  nome_fantasia: novaEmpresa.nome_fantasia,
  razao_social: novaEmpresa.razao_social,
  cnpj: novaEmpresa.cnpj,
  setor_economico: novaEmpresa.setor_economico,
  setor_empresa: novaEmpresa.setor_empresa,
  segmento: novaEmpresa.segmento,
  tema_segmento: novaEmpresa.tema_segmento,
  municipio: novaEmpresa.municipio,
  endereco: novaEmpresa.endereco,
  apresentacao: novaEmpresa.apresentacao,
  descricao_produtos: novaEmpresa.descricao_produtos,
  instagram: novaEmpresa.instagram,
  facebook: novaEmpresa.facebook,
  youtube: novaEmpresa.youtube,
  linkedin: novaEmpresa.linkedin,
  twitter: novaEmpresa.twitter,
  video_apresentacao: novaEmpresa.video_apresentacao,
  status: "ativo",
  produtos: [],
  arquivos: [],
  relacionadas: []
      }
      
      const result = await criarEmpresa(empresaData)
      
      if (result) {
        // Atualizar a lista de empresas
        const empresasData = await buscarEmpresasAdmin({
          status: selectedStatus === "all" ? undefined : selectedStatus,
          setor_economico: selectedSector === "all" ? undefined : selectedSector,
          municipio: selectedCity === "all" ? undefined : selectedCity,
          busca: searchTerm,
        })
        setEmpresas(empresasData)
        
        // Atualizar estatísticas
        setStats(prev => ({
          ...prev,
          totalEmpresas: prev.totalEmpresas + 1,
          empresasAtivas: prev.empresasAtivas + 1
        }))
        
        // Limpar formulário e fechar modal
        setNovaEmpresa({
          // Dados de Acesso
          email: "",
          password: "",
          confirmPassword: "",
          // Dados da Empresa
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
        setShowCreateDialog(false)
        
        alert("Empresa criada com sucesso!")
      } else {
        alert("Erro ao criar empresa. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao criar empresa:", error)
      alert("Erro ao criar empresa. Verifique os dados e tente novamente.")
    } finally {
      setCreatingEmpresa(false)
    }
  }

  const handleCreateAdmin = async () => {
    // Validação dos campos obrigatórios
    if (!novoAdmin.nome || !novoAdmin.email || !novoAdmin.password || !novoAdmin.confirmPassword) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    // Validação de confirmação de senha
    if (novoAdmin.password !== novoAdmin.confirmPassword) {
      alert("As senhas não coincidem")
      return
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(novoAdmin.email)) {
      alert("Digite um email válido")
      return
    }

    setCreatingAdmin(true)
    try {
      // Criar administrador via API route
      const response = await fetch('/api/criar-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: novoAdmin.nome,
          email: novoAdmin.email,
          password: novoAdmin.password,
          cargo: novoAdmin.cargo
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Recarregar lista de administradores
        const adminsData = await obterTodosAdmins()
        setAdmins(adminsData)
        
        // Limpar formulário e fechar modal
        setNovoAdmin({
          nome: "",
          email: "",
          password: "",
          confirmPassword: "",
          cargo: ""
        })
        setShowCreateAdminDialog(false)
        
        alert("Administrador criado com sucesso!")
      } else {
        alert(`Erro ao criar administrador: ${result.error}`)
      }
    } catch (error) {
      console.error("Erro ao criar administrador:", error)
      alert("Erro ao criar administrador. Verifique a conexão.")
    } finally {
      setCreatingAdmin(false)
    }
  }

  // Funções para gerenciamento de administradores
  const handleEditAdmin = (admin: Admin) => {
    setAdminToEdit(admin)
    setShowEditAdminDialog(true)
  }

  const handleUpdateAdmin = async () => {
    if (!adminToEdit) return

    setEditingAdmin(true)
    try {
      const response = await fetch('/api/gerenciar-admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: adminToEdit.id,
          nome: adminToEdit.nome,
          email: adminToEdit.email,
          cargo: adminToEdit.cargo,
          ativo: adminToEdit.ativo
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Recarregar lista de administradores
        const adminsData = await obterTodosAdmins()
        setAdmins(adminsData)
        
        setShowEditAdminDialog(false)
        setAdminToEdit(null)
        
        alert("Administrador atualizado com sucesso!")
      } else {
        alert(`Erro ao atualizar administrador: ${result.error}`)
      }
    } catch (error) {
      console.error("Erro ao atualizar administrador:", error)
      alert("Erro ao atualizar administrador. Verifique a conexão.")
    } finally {
      setEditingAdmin(false)
    }
  }

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm(`Tem certeza que deseja excluir o administrador "${admin.nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      const response = await fetch(`/api/gerenciar-admin?id=${admin.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Recarregar lista de administradores
        const adminsData = await obterTodosAdmins()
        setAdmins(adminsData)
        
        alert("Administrador excluído com sucesso!")
      } else {
        alert(`Erro ao excluir administrador: ${result.error}`)
      }
    } catch (error) {
      console.error("Erro ao excluir administrador:", error)
      alert("Erro ao excluir administrador. Verifique a conexão.")
    }
  }

  const handleResetPassword = (admin: Admin) => {
    setAdminToResetPassword(admin)
    setNewPassword("")
    setConfirmNewPassword("")
    setShowPasswordDialog(true)
  }

  const handleConfirmResetPassword = async () => {
    if (!adminToResetPassword) return

    if (newPassword !== confirmNewPassword) {
      alert("As senhas não coincidem")
      return
    }

    if (newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setResetingPassword(true)
    try {
      const response = await fetch('/api/resetar-senha-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: adminToResetPassword.id,
          novaSenha: newPassword
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setShowPasswordDialog(false)
        setAdminToResetPassword(null)
        setNewPassword("")
        setConfirmNewPassword("")
        
        alert("Senha resetada com sucesso!")
      } else {
        alert(`Erro ao resetar senha: ${result.error}`)
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error)
      alert("Erro ao resetar senha. Verifique a conexão.")
    } finally {
      setResetingPassword(false)
    }
  }

  const handleToggleAdminStatus = async (admin: Admin) => {
    const newStatus = !admin.ativo
    const actionText = newStatus ? "ativar" : "desativar"
    
    if (!confirm(`Tem certeza que deseja ${actionText} o administrador "${admin.nome}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/gerenciar-admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: admin.id,
          nome: admin.nome,
          email: admin.email,
          cargo: admin.cargo,
          ativo: newStatus
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Recarregar lista de administradores
        const adminsData = await obterTodosAdmins()
        setAdmins(adminsData)
        
        alert(`Administrador ${newStatus ? 'ativado' : 'desativado'} com sucesso!`)
      } else {
        alert(`Erro ao ${actionText} administrador: ${result.error}`)
      }
    } catch (error) {
      console.error(`Erro ao ${actionText} administrador:`, error)
      alert(`Erro ao ${actionText} administrador. Verifique a conexão.`)
    }
  }

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
        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="glass shadow-xl shadow-slate-200/50 border-white/40 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total de Empresas</CardTitle>
              <div className="w-10 h-10 bg-slate-900/5 rounded-xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                <Factory className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-black text-slate-900 mb-1">{loading ? "..." : stats.totalEmpresas}</div>
              <p className="text-[0.7rem] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                +{loading ? "..." : stats.novosCadastrosMes} novos <span className="text-slate-400 font-medium">este mês</span>
              </p>
            </CardContent>
          </Card>

          <Card className="glass shadow-xl shadow-slate-200/50 border-white/40 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Empresas Ativas</CardTitle>
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-black text-slate-900 mb-1">{loading ? "..." : stats.empresasAtivas}</div>
              <p className="text-[0.7rem] font-medium text-slate-400">Públicas no portal</p>
            </CardContent>
          </Card>

          <Card className="glass shadow-xl shadow-slate-200/50 border-white/40 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Pendentes</CardTitle>
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-black text-slate-900 mb-1">{loading ? "..." : stats.empresasPendentes}</div>
              <p className="text-[0.7rem] font-medium text-slate-400">Aguardando análise</p>
            </CardContent>
          </Card>

          <Card className="glass shadow-xl shadow-slate-200/50 border-white/40 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Produtos</CardTitle>
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-black text-slate-900 mb-1">{loading ? "..." : stats.totalProdutos}</div>
              <p className="text-[0.7rem] font-medium text-slate-400">Itens cadastrados</p>
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
            <TabsTrigger value="administradores">
              Administradores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="empresas" className="outline-none animate-in fade-in-50 duration-500">
            <div className="space-y-6">
              {/* Search and Filters Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                <div className="flex-1 w-full space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Buscar Empresa</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Nome, CNPJ ou e-mail..." 
                      className="pl-10 rounded-xl border-slate-200 focus:ring-green-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-48 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Município</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Municípios</SelectItem>
                      {municipios.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="default" className="rounded-xl bg-slate-900 hover:bg-slate-800 h-10 px-6">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Filtrar
                </Button>
              </div>

              <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="font-display font-black text-slate-900">Gerenciamento de Empresas</CardTitle>
                      <CardDescription className="font-medium">Total de {empresas.length} empresas encontradas</CardDescription>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button className="rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200">
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Empresa
                        </Button>
                      </DialogTrigger>
                      {/* Original Dialog Content starts here */}
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
                        <DialogDescription>
                          Preencha as informações da empresa que será cadastrada no sistema.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Dados de Acesso */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Dados de Acesso</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="seuemail@exemplo.com"
                                value={novaEmpresa.email}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, email: e.target.value }))}
                                required
                                autoComplete="email"
                              />
                            </div>
                            <div>
                              <Label htmlFor="password">Senha *</Label>
                              <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={novaEmpresa.password}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, password: e.target.value }))}
                                required
                                autoComplete="new-password"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="********"
                                value={novaEmpresa.confirmPassword}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                                autoComplete="new-password"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dados da Empresa */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Dados da Empresa</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                              <Input
                                id="nome_fantasia"
                                placeholder="Nome comercial da empresa"
                                value={novaEmpresa.nome_fantasia}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="razao_social">Razão Social *</Label>
                              <Input
                                id="razao_social"
                                placeholder="Razão social completa"
                                value={novaEmpresa.razao_social}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, razao_social: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cnpj">CNPJ *</Label>
                              <Input
                                id="cnpj"
                                placeholder="00.000.000/0001-00"
                                value={novaEmpresa.cnpj}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, cnpj: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="municipio">Município *</Label>
                              <Select
                                value={novaEmpresa.municipio}
                                onValueChange={(value) => setNovaEmpresa(prev => ({ ...prev, municipio: value }))}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o município" />
                                </SelectTrigger>
                                <SelectContent>
                                  {municipios.map((municipio) => (
                                    <SelectItem key={municipio.value} value={municipio.value}>
                                      {municipio.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="endereco">Endereço *</Label>
                              <Input
                                id="endereco"
                                placeholder="Endereço completo da empresa"
                                value={novaEmpresa.endereco}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, endereco: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="setor_economico">Setor Econômico *</Label>
                              <Select
                                value={novaEmpresa.setor_economico}
                                onValueChange={(value) => setNovaEmpresa(prev => ({ ...prev, setor_economico: value }))}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o setor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {setoresEconomicos.map((setor) => (
                                    <SelectItem key={setor.value} value={setor.value}>
                                      {setor.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="setor_empresa">Setor da Empresa *</Label>
                              <Input
                                id="setor_empresa"
                                placeholder="Ex: Alimentos, Madeira, etc."
                                value={novaEmpresa.setor_empresa}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, setor_empresa: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="apresentacao">Apresentação *</Label>
                              <Textarea
                                id="apresentacao"
                                placeholder="Breve apresentação da empresa..."
                                value={novaEmpresa.apresentacao}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, apresentacao: e.target.value }))}
                                rows={3}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="descricao_produtos">Descrição dos Produtos/Serviços *</Label>
                              <Textarea
                                id="descricao_produtos"
                                placeholder="Descrição dos produtos e serviços oferecidos..."
                                value={novaEmpresa.descricao_produtos}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, descricao_produtos: e.target.value }))}
                                rows={3}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Redes Sociais (Opcional) */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Redes Sociais (Opcional)</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="instagram">Instagram</Label>
                              <Input
                                id="instagram"
                                placeholder="@empresa"
                                value={novaEmpresa.instagram}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, instagram: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="facebook">Facebook</Label>
                              <Input
                                id="facebook"
                                placeholder="facebook.com/empresa"
                                value={novaEmpresa.facebook}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, facebook: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="linkedin">LinkedIn</Label>
                              <Input
                                id="linkedin"
                                placeholder="linkedin.com/company/empresa"
                                value={novaEmpresa.linkedin}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, linkedin: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="youtube">YouTube</Label>
                              <Input
                                id="youtube"
                                placeholder="youtube.com/@empresa"
                                value={novaEmpresa.youtube}
                                onChange={(e) => setNovaEmpresa(prev => ({ ...prev, youtube: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateEmpresa} disabled={creatingEmpresa}>
                          {creatingEmpresa ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Criando...
                            </>
                          ) : (
                            "Criar Empresa"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="pl-8 font-bold text-slate-500 h-14">Empresa / Razão Social</TableHead>
                        <TableHead className="font-bold text-slate-500 h-14">Localização</TableHead>
                        <TableHead className="font-bold text-slate-500 h-14">Status</TableHead>
                        <TableHead className="font-bold text-slate-500 h-14">Cadastro</TableHead>
                        <TableHead className="pr-8 text-right font-bold text-slate-500 h-14">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">
                            Nenhuma empresa encontrada com os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        empresas.map((empresa) => (
                          <TableRow key={empresa.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="pl-8 py-4">
                              <div className="flex items-center gap-3">
                                {empresa.logo_url ? (
                                  <img src={empresa.logo_url} className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-100 shadow-sm" alt="" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Building2 className="h-5 w-5" />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{empresa.nome_fantasia}</span>
                                  <span className="text-xs text-slate-400 font-medium">{empresa.razao_social}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{empresa.municipio}</span>
                                <span className="text-[0.65rem] text-slate-400 uppercase tracking-wider font-bold">{empresa.setor_empresa}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-full px-3 py-0.5 text-[0.65rem] font-black uppercase tracking-wider ${
                                empresa.status === 'ativo' ? 'bg-green-50 text-green-700 border-green-100' :
                                empresa.status === 'pendente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {empresa.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-500">
                              {formatBrazilianShortDate(empresa.created_at)}
                            </TableCell>
                            <TableCell className="pr-8 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-md transition-all">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-slate-200 p-2 min-w-[160px]">
                                  <DropdownMenuLabel className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Ações de Gestão</DropdownMenuLabel>
                                  <Link href={`/empresas/${empresa.id}`} target="_blank">
                                    <DropdownMenuCheckboxItem className="rounded-lg gap-2 cursor-pointer font-bold text-sm">
                                      <Eye className="h-4 w-4 text-slate-400" /> Ver Perfil
                                    </DropdownMenuCheckboxItem>
                                  </Link>
                                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                  <DropdownMenuLabel className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Alterar Status</DropdownMenuLabel>
                                  <DropdownMenuCheckboxItem 
                                    className="rounded-lg gap-2 cursor-pointer text-green-600 font-bold text-sm"
                                    checked={empresa.status === "ativo"}
                                    onCheckedChange={() => handleStatusChange(empresa.id, "ativo")}
                                  >
                                    <CheckCircle className="h-4 w-4" /> Ativo
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem 
                                    className="rounded-lg gap-2 cursor-pointer text-amber-600 font-bold text-sm"
                                    checked={empresa.status === "pendente"}
                                    onCheckedChange={() => handleStatusChange(empresa.id, "pendente")}
                                  >
                                    <Clock className="h-4 w-4" /> Pendente
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem 
                                    className="rounded-lg gap-2 cursor-pointer text-slate-600 font-bold text-sm"
                                    checked={empresa.status === "inativo"}
                                    onCheckedChange={() => handleStatusChange(empresa.id, "inativo")}
                                  >
                                    <UserX className="h-4 w-4" /> Inativo
                                  </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="administradores" className="outline-none animate-in fade-in-50 duration-500">
            <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display font-black text-slate-900">Corpo Administrativo</CardTitle>
                    <CardDescription className="font-medium">Gestão de acesso e privilégios do sistema</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateAdminDialog(true)} className="rounded-xl bg-slate-900 hover:bg-slate-800">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Admin
                  </Button>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="pl-8 font-bold text-slate-500 h-14">Nome / Cargo</TableHead>
                        <TableHead className="font-bold text-slate-500 h-14">E-mail</TableHead>
                        <TableHead className="font-bold text-slate-500 h-14">Status</TableHead>
                        <TableHead className="pr-8 text-right font-bold text-slate-500 h-14">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map(admin => (
                          <TableRow key={admin.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="pl-8 py-4">
                               <div className="flex flex-col">
                                  <span className="font-bold text-slate-900">{admin.nome}</span>
                                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{admin.cargo || 'Membro da Equipe'}</span>
                               </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-600">{admin.email}</TableCell>
                            <TableCell>
                              <Badge className={`rounded-full px-3 py-0.5 text-[0.65rem] font-black uppercase tracking-wider ${
                                admin.ativo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {admin.ativo ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-8 text-right space-x-2">
                               <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => handleEditAdmin(admin)}>
                                  <Edit className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteAdmin(admin)}>
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para editar administrador */}
      <Dialog open={showEditAdminDialog} onOpenChange={setShowEditAdminDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
            <DialogDescription>
              Altere as informações do administrador selecionado.
            </DialogDescription>
          </DialogHeader>
          {adminToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-nome"
                  value={adminToEdit.nome}
                  onChange={(e) => setAdminToEdit({...adminToEdit, nome: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={adminToEdit.email}
                  onChange={(e) => setAdminToEdit({...adminToEdit, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cargo" className="text-right">
                  Cargo
                </Label>
                <Input
                  id="edit-cargo"
                  value={adminToEdit.cargo || ""}
                  onChange={(e) => setAdminToEdit({...adminToEdit, cargo: e.target.value})}
                  className="col-span-3"
                  placeholder="Ex: Administrador Geral"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ativo" className="text-right">
                  Status
                </Label>
                <Select
                  value={adminToEdit.ativo ? "true" : "false"}
                  onValueChange={(value) => setAdminToEdit({...adminToEdit, ativo: value === "true"})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEditAdminDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateAdmin} disabled={editingAdmin}>
              {editingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para resetar senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para o administrador "{adminToResetPassword?.nome}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Nova Senha
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password" className="text-right">
                Confirmar
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="col-span-3"
                placeholder="Repita a nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmResetPassword} disabled={resetingPassword}>
              {resetingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetando...
                </>
              ) : (
                "Resetar Senha"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
