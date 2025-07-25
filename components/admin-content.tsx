"use client" // Este é um Client Component

import { useState, useEffect } from "react"
import Link from "next/link"
import { Factory, Package, Plus, Eye, CheckCircle, Clock, Search, ChevronDown, Loader2, UserPlus, Edit, Key, UserX, UserCheck, Trash2 } from "lucide-react"
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
        produtos: [],
        arquivos: []
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
            <TabsTrigger value="administradores">
              Administradores
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
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Empresa
                      </Button>
                    </DialogTrigger>
                    
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
                                  <SelectItem value="Rio Branco">Rio Branco</SelectItem>
                                  <SelectItem value="Cruzeiro do Sul">Cruzeiro do Sul</SelectItem>
                                  <SelectItem value="Sena Madureira">Sena Madureira</SelectItem>
                                  <SelectItem value="Feijo">Feijó</SelectItem>
                                  <SelectItem value="Tarauaca">Tarauacá</SelectItem>
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
                                  <SelectItem value="industria">Indústria</SelectItem>
                                  <SelectItem value="comercio">Comércio</SelectItem>
                                  <SelectItem value="servicos">Serviços</SelectItem>
                                  <SelectItem value="agropecuaria">Agropecuária</SelectItem>
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

          <TabsContent value="administradores">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciamento de Administradores</CardTitle>
                    <CardDescription>Visualize e gerencie os administradores do sistema.</CardDescription>
                  </div>
                  <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Novo Administrador
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Administrador</DialogTitle>
                        <DialogDescription>
                          Preencha as informações do novo administrador do sistema.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="admin_nome">Nome Completo *</Label>
                          <Input
                            id="admin_nome"
                            placeholder="Nome completo do administrador"
                            value={novoAdmin.nome}
                            onChange={(e) => setNovoAdmin(prev => ({ ...prev, nome: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="admin_email">Email *</Label>
                          <Input
                            id="admin_email"
                            type="email"
                            placeholder="admin@exemplo.com"
                            value={novoAdmin.email}
                            onChange={(e) => setNovoAdmin(prev => ({ ...prev, email: e.target.value }))}
                            required
                            autoComplete="email"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="admin_password">Senha *</Label>
                          <Input
                            id="admin_password"
                            type="password"
                            placeholder="********"
                            value={novoAdmin.password}
                            onChange={(e) => setNovoAdmin(prev => ({ ...prev, password: e.target.value }))}
                            required
                            autoComplete="new-password"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="admin_confirmPassword">Confirmar Senha *</Label>
                          <Input
                            id="admin_confirmPassword"
                            type="password"
                            placeholder="********"
                            value={novoAdmin.confirmPassword}
                            onChange={(e) => setNovoAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                            autoComplete="new-password"
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateAdminDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateAdmin} disabled={creatingAdmin}>
                          {creatingAdmin ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Criando...
                            </>
                          ) : (
                            "Criar Administrador"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {admins.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum Administrador Encontrado</h3>
                    <p className="text-gray-600 mb-4">
                      Ainda não há administradores cadastrados no sistema.
                    </p>
                    <p className="text-sm text-gray-500">
                      Use o botão "Novo Administrador" acima para criar o primeiro administrador.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">Nome</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Cargo</th>
                          <th className="border border-gray-200 px-4 py-2 text-center">Status</th>
                          <th className="border border-gray-200 px-4 py-2 text-center">Criado em</th>
                          <th className="border border-gray-200 px-4 py-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2 font-medium">
                              {admin.nome}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-gray-600">
                              {admin.email}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-gray-600">
                              {admin.cargo || "-"}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  admin.ativo
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {admin.ativo ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center text-sm text-gray-600">
                              {new Date(admin.created_at).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAdmin(admin)}
                                  className="h-8 w-8 p-0"
                                  title="Editar administrador"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResetPassword(admin)}
                                  className="h-8 w-8 p-0"
                                  title="Resetar senha"
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleAdminStatus(admin)}
                                  className={`h-8 w-8 p-0 ${
                                    admin.ativo 
                                      ? "text-red-600 hover:text-red-700" 
                                      : "text-green-600 hover:text-green-700"
                                  }`}
                                  title={admin.ativo ? "Desativar administrador" : "Ativar administrador"}
                                >
                                  {admin.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteAdmin(admin)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  title="Excluir administrador"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
