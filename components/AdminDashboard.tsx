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
  ListFilter,
  AlertCircle
} from "lucide-react"
import { IndustrialDetailsModal } from "@/components/IndustrialDetailsModal"
import { ConfiguracoesModal } from "@/components/ConfiguracoesModal"
import { UploadComponent } from "./upload-component"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cadastroCompletoSchema, type CadastroFormData } from "@/lib/schemas/cadastro-schema"
import { EmpresaFormAdmin } from "@/components/cadastro/EmpresaFormAdmin"
import { ProdutosForm } from "@/components/cadastro/ProdutosForm"
import { RedesSociaisForm } from "@/components/cadastro/RedesSociaisForm"
import {
  obterEstatisticasAdmin,
  buscarEmpresasAdmin,
  atualizarStatusEmpresa,
  obterTodosAdmins,
  atualizarStatusAdmin,
  criarAdmin,
} from "@/lib/admin"
import { 
  criarEmpresa, 
  excluirEmpresa, 
  atualizarEmpresa 
} from "@/lib/services/empresa-service"
import { logout } from "@/lib/auth"
import type { Empresa, Admin } from "@/lib/supabase.types"
import { formatBrazilianShortDate, cn } from "@/lib/utils"
import { LogoSeict } from "@/components/LogoIndustria"
import { createServerSideClient } from "@/lib/supabase"

interface AdminDashboardProps {
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

export default function AdminDashboard({ initialStats, initialEmpresas, isConfiguredProp, user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mounted, setMounted] = useState(false)
  
  // Impede erro de hidratação garantindo que o render coincida com o servidor no primeiro frame
  useEffect(() => {
    setMounted(true)
  }, [])
  const [stats, setStats] = useState(initialStats)
  const [empresas, setEmpresas] = useState(initialEmpresas)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSector, setSelectedSector] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")

  const SETORES_ECONOMICOS = [
    { value: "industria", label: "Indústria" },
    { value: "agroindustria", label: "Agroindústria" },
    { value: "servicos", label: "Serviços" },
    { value: "comercio", label: "Comércio" },
  ]

  const SETORES_EMPRESA = [
    { value: "alimentos", label: "Alimentos e Bebidas" },
    { value: "madeira", label: "Madeira e Móveis" },
    { value: "construcao", label: "Construção Civil" },
    { value: "tecnologia", label: "Tecnologia" },
    { value: "textil", label: "Têxtil" },
    { value: "outros", label: "Outros" },
  ]

  // Estados para modais
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null)
  
  const [creatingEmpresa, setCreatingEmpresa] = useState(false)
  const [updatingCompany, setUpdatingCompany] = useState(false)

  // State para as abas internas do diálogo
  const [createStepTab, setCreateStepTab] = useState("empresa")

  const methods = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroCompletoSchema),
    defaultValues: {
      acesso: { email: `temp-${Date.now()}@example.com`, password: "dummy-password-123", confirmPassword: "dummy-password-123", contactName: "Admin Created" },
      empresa: { 
        status: "ativo",
        setor_economico: "",
        setor_empresa: "",
        municipio: "" 
      },
      produtos: []
    }
  })

  const { formState: { errors } } = methods

  const validateStep = async (step: "empresa" | "contato") => {
    const fieldsToValidate = step === "empresa" 
      ? ["empresa.nome_fantasia", "empresa.razao_social", "empresa.cnpj", "empresa.setor_economico", "empresa.setor_empresa", "empresa.descricao_produtos", "empresa.apresentacao", "empresa.endereco", "empresa.municipio"]
      : ["empresa.email", "empresa.telefone"]
    
    const result = await methods.trigger(fieldsToValidate as any)
    return result
  }

  const handleTabChange = async (newTab: string) => {
    // Se estiver tentando avançar da empresa para contato/produtos
    if (createStepTab === "empresa" && (newTab === "contato" || newTab === "produtos")) {
      const isValid = await validateStep("empresa")
      if (!isValid) return
    }
    
    // Se estiver tentando avançar do contato para produtos
    if (createStepTab === "contato" && newTab === "produtos") {
      const isValid = await validateStep("contato")
      if (!isValid) return
    }
    
    setCreateStepTab(newTab)
  }

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
  
  // Estados para exclusão de empresa
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Empresa | null>(null)
  const [deletingCompany, setDeletingCompany] = useState(false)

  const MUNICIPIOS_LIST = [
    "Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Feijó", "Tarauacá", 
    "Brasiléia", "Xapuri", "Senador Guiomard", "Plácido de Castro", "Manoel Urbano", 
    "Assis Brasil", "Capixaba", "Porto Acre", "Rodrigues Alves", "Marechal Thaumaturgo", 
    "Porto Walter", "Santa Rosa do Purus", "Jordão", "Acrelândia", "Bujari", 
    "Epitaciolândia", "Mâncio Lima"
  ].sort()

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

  const handleCreateEmpresa = async (data: CadastroFormData) => {
    setCreatingEmpresa(true)
    try {
      const { criarProduto, criarArquivo } = await import("@/lib/database")
      
      // 1. Cria a Empresa
      const empresa = await criarEmpresa(data.empresa)
      
      if (empresa) {
        const empresaId = (empresa as any).id
        const filePromises: Promise<any>[] = []

        // Registrar Logo
        if (data.empresa.logo_url) {
          filePromises.push(
            criarArquivo({
              empresa_id: empresaId,
              nome: "Logo da Empresa",
              url: data.empresa.logo_url,
              tipo: "imagem",
              categoria: "logo",
            })
          )
        }

        // Registrar Folder Institucional
        if (data.empresa.folder_apresentacao_url) {
          filePromises.push(
            criarArquivo({
              empresa_id: empresaId,
              nome: "Folder de Apresentação",
              url: data.empresa.folder_apresentacao_url,
              tipo: "pdf",
              categoria: "institucional_folder",
            })
          )
        }

        // Registrar Outros Arquivos Institucionais
        if (data.empresa.outros_arquivos_urls && data.empresa.outros_arquivos_urls.length > 0) {
          data.empresa.outros_arquivos_urls.forEach((url) => {
            filePromises.push(
              criarArquivo({
                empresa_id: empresaId,
                nome: "Outro Arquivo da Empresa",
                url: url,
                tipo: url.endsWith(".pdf") ? "pdf" : "imagem",
                categoria: "institucional_outros",
              })
            )
          })
        }

        // 2. Cria os Produtos vinculados
        if (data.produtos && data.produtos.length > 0) {
          for (const p of data.produtos) {
            const novoProduto = await criarProduto({ 
              ...p, 
              status: 'ativo',
              empresa_id: empresaId 
            })

            if (novoProduto) {
              if (p.ficha_tecnica_url) {
                filePromises.push(
                  criarArquivo({
                    empresa_id: empresaId,
                    nome: `Ficha Técnica - ${p.nome}`,
                    url: p.ficha_tecnica_url,
                    tipo: "pdf",
                    categoria: "produto_ficha_tecnica",
                  })
                )
              }
              
              if (p.folder_produto_url) {
                filePromises.push(
                  criarArquivo({
                    empresa_id: empresaId,
                    nome: `Folder Produto - ${p.nome}`,
                    url: p.folder_produto_url,
                    tipo: "pdf",
                    categoria: "produto_folder",
                  })
                )
              }
              
              if (p.imagens_produto_urls && p.imagens_produto_urls.length > 0) {
                p.imagens_produto_urls.forEach((url) => {
                  filePromises.push(
                    criarArquivo({
                      empresa_id: empresaId,
                      nome: `Imagem Produto - ${p.nome}`,
                      url: url,
                      tipo: "imagem",
                      categoria: "produto_imagem",
                    })
                  )
                })
              }
            }
          }
        }

        await Promise.allSettled(filePromises)

        const empresasData = await buscarEmpresasAdmin()
        setEmpresas(empresasData)
        setShowFormDialog(false)
        methods.reset()
        setCreateStepTab("empresa")
        alert("Empresa cadastrada com sucesso!")
      }
    } catch (error: any) {
      console.error("Erro ao criar empresa:", error)
      const errorMsg = error.message?.includes("duplicate key") 
        ? "Erro: CNPJ já cadastrado no sistema." 
        : `Erro ao criar perfil industrial: ${error.message || ""}`
      alert(errorMsg)
    } finally {
      setCreatingEmpresa(false)
    }
  }

  const handleUpdateEmpresa = async (data: CadastroFormData) => {
    if (!currentEditingId) return
    setUpdatingCompany(true)
    try {
      const { atualizarEmpresaCompleta } = await import("@/lib/database")
      
      // Chamar a nova Server Action unificada que lida com Empresa + Produtos + Arquivos no servidor
      const success = await atualizarEmpresaCompleta(currentEditingId, data)
      
      if (success) {
        const empresasData = await buscarEmpresasAdmin()
        setEmpresas(empresasData)
        setShowFormDialog(false)
        alert("Perfil industrial atualizado com sucesso!")
      } else {
        throw new Error("Falha na sincronização dos dados no servidor.")
      }
    } catch (error: any) {
      console.error("Erro ao atualizar:", error)
      alert(`Erro ao atualizar perfil industrial: ${error.message || ""}`)
    } finally {
      setUpdatingCompany(false)
    }
  }

  const handleEditClick = (company: Empresa) => {
    setIsEditing(true)
    setCurrentEditingId(company.id)
    
    // Mapear arquivos institucionais
    const folder = company.arquivos?.find(a => a.categoria === 'institucional_folder')?.url || ""
    const outros = company.arquivos?.filter(a => a.categoria === 'institucional_outros').map(a => a.url) || []

    // Mapear produtos
    const produtosFixed = company.produtos?.map(p => {
      const ficha = company.arquivos?.find(a => a.categoria === 'produto_ficha_tecnica' && a.nome.includes(p.nome))?.url || ""
      const folderProd = company.arquivos?.find(a => a.categoria === 'produto_folder' && a.nome.includes(p.nome))?.url || ""
      const imagens = company.arquivos?.filter(a => a.categoria === 'produto_imagem' && a.nome.includes(p.nome)).map(a => a.url) || []
      
      return {
        ...p,
        ficha_tecnica_url: ficha,
        folder_produto_url: folderProd,
        imagens_produto_urls: imagens
      }
    }) || []

    methods.reset({
      empresa: {
        ...company,
        folder_apresentacao_url: folder,
        outros_arquivos_urls: outros
      },
      produtos: produtosFixed,
      acesso: { email: "edit@example.com", password: "dummy", confirmPassword: "dummy", contactName: "Edit Mode" }
    })
    setCreateStepTab("empresa")
    setShowFormDialog(true)
  }

  const handleCreateNewClick = () => {
    setIsEditing(false)
    setCurrentEditingId(null)
    methods.reset({
      acesso: { email: `temp-${Date.now()}@example.com`, password: "dummy-password-123", confirmPassword: "dummy-password-123", contactName: "Admin Created" },
      empresa: { status: "ativo" },
      produtos: []
    })
    setCreateStepTab("empresa")
    setShowFormDialog(true)
  }

  const handleViewDetails = (empresa: Empresa) => {
    setCompanyToView(empresa)
    setShowDetailsDialog(true)
  }

  const handleDeleteCompanyClick = (empresa: Empresa) => {
    setCompanyToDelete(empresa)
    setShowDeleteDialog(true)
  }

  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return
    
    setDeletingCompany(true)
    try {
      const result = await excluirEmpresa(companyToDelete.id)
      
      if (result) {
        setEmpresas(prev => prev.filter(e => e.id !== companyToDelete.id))
        const updatedStats = await obterEstatisticasAdmin()
        setStats(updatedStats)
      } else {
        alert("Erro ao excluir empresa")
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro de conexão ao excluir empresa")
    } finally {
      setDeletingCompany(false)
      setShowDeleteDialog(false)
      setCompanyToDelete(null)
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

  const handleCreateAdmin = async () => {
    if (!novoAdmin.nome || !novoAdmin.email || !novoAdmin.password) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    if (novoAdmin.password !== novoAdmin.confirmPassword) {
      alert("As senhas não coincidem")
      return
    }

    setCreatingAdmin(true)
    try {
      const result = await criarAdmin({
        nome: novoAdmin.nome,
        email: novoAdmin.email,
        password: novoAdmin.password,
        cargo: novoAdmin.cargo
      })

      if (result) {
        setAdmins(prev => [result, ...prev])
        setShowCreateAdminDialog(false)
        setNovoAdmin({
          nome: "",
          email: "",
          password: "",
          confirmPassword: "",
          cargo: ""
        })
        alert("Administrador cadastrado com sucesso!")
      }
    } catch (error: any) {
      console.error("Erro ao criar administrador:", error)
      alert(error.message || "Erro ao criar administrador")
    } finally {
      setCreatingAdmin(false)
    }
  }

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const updated = await atualizarStatusAdmin(adminId, !currentStatus)
      if (updated) {
        setAdmins(prev => prev.map(a => a.id === adminId ? updated : a))
      }
    } catch (error) {
      console.error("Erro ao atualizar status do admin:", error)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
        <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
          <div className="p-8 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-green-600 rounded-xl shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform">
                <LogoSeict className=" text-white" />
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

        <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
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
                <span className="text-[10px] font-bold text-green-100/70 uppercase tracking-tighter leading-none mb-1">
                  {user?.isSuperAdmin ? 'Administrador Geral' : 'Administrador'}
                </span>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5" onClick={() => handleEditClick(e)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteCompanyClick(e)}>
                                <Trash2 className="h-4 w-4" />
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

            <TabsContent value="empresas" className="mt-0 outline-none space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex-1 w-full space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pesquisar Base de Dados</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Nome da empresa, CNPJ, responsável..." className="pl-10 rounded-xl h-11 border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleCreateNewClick} className="rounded-xl bg-primary h-11 font-bold px-6 shadow-lg shadow-primary/20"><Plus className="h-4 w-4 mr-2" /> Nova Indústria</Button>
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
                        <TableHead className="h-12">Contato</TableHead>
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
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-700">{empresa.telefone || "-"}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{empresa.email || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${empresa.status === 'ativo' ? 'bg-green-50 text-green-700 border-green-100' :
                              empresa.status === 'pendente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-slate-50 text-slate-700 border-slate-100'
                              }`}>
                              {empresa.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5" title="Visualizar" onClick={() => handleViewDetails(empresa)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50" title="Editar" onClick={() => handleEditClick(empresa)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" title="Excluir" onClick={() => handleDeleteCompanyClick(empresa)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl p-2">
                                  <DropdownMenuLabel className="text-[0.6rem] uppercase tracking-[0.2em] opacity-50 px-2 py-2">Estado Industrial</DropdownMenuLabel>
                                  <DropdownMenuCheckboxItem className="rounded-lg" checked={empresa.status === 'ativo'} onCheckedChange={() => handleStatusChange(empresa.id, 'ativo')}>Ativo</DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem className="rounded-lg" checked={empresa.status === 'pendente'} onCheckedChange={() => handleStatusChange(empresa.id, 'pendente')}>Pendente</DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem className="rounded-lg" checked={empresa.status === 'inativo'} onCheckedChange={() => handleStatusChange(empresa.id, 'inativo')}>Inativo</DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

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
                        <TableRow key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border-2 border-white shadow-sm">
                                {admin.nome.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{admin.nome}</span>
                                <span className="text-xs text-slate-400">{admin.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-bold uppercase tracking-widest text-slate-500">{admin.cargo || 'Gestor Admin'}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${admin.ativo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                              {admin.ativo ? 'Ativo' : 'Bloqueado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl"><ChevronDown className="h-4 w-4 text-slate-400" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl p-2">
                                <DropdownMenuItem
                                  className="gap-2 rounded-lg cursor-pointer"
                                  onClick={() => { setAdminToEdit(admin); setShowEditAdminDialog(true); }}
                                >
                                  <Edit className="h-4 w-4" /> Editar Perfil
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-[0.6rem] uppercase tracking-[0.2em] opacity-50 px-2 py-2">Segurança</DropdownMenuLabel>

                                <DropdownMenuItem
                                  className={`gap-2 rounded-lg cursor-pointer ${admin.ativo ? 'text-amber-600' : 'text-green-600'}`}
                                  onClick={() => handleToggleAdminStatus(admin.id, !!admin.ativo)}
                                >
                                  {admin.ativo ? (
                                    <><UserX className="h-4 w-4" /> Bloquear Acesso</>
                                  ) : (
                                    <><UserCheck className="h-4 w-4" /> Reativar Acesso</>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="gap-2 rounded-lg cursor-pointer text-slate-400 cursor-not-allowed opacity-50"
                                  disabled
                                >
                                  <Key className="h-4 w-4" /> Resetar Senha
                                </DropdownMenuItem>
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
          </main>
        </div>
      </Tabs>

  <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                {isEditing ? <Edit className="h-6 w-6 text-primary" /> : <Building2 className="h-6 w-6 text-primary" />}
              </div>
              {isEditing ? "Editar Perfil Industrial" : "Cadastrar Nova Empresa"}
            </DialogTitle>
            <p className="text-slate-500 text-sm mt-1">
              {isEditing ? "Atualize as informações completas desta indústria" : "Preencha as informações da sua empresa para aparecer na plataforma"}
            </p>
          </DialogHeader>
          
          <FormProvider {...methods}>
            <Tabs value={createStepTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12 p-1 bg-slate-100/50 rounded-2xl">
                <TabsTrigger value="empresa" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                  Dados da Empresa
                  {Object.keys(errors.empresa || {}).some(k => ["nome_fantasia", "razao_social", "cnpj", "setor_economico", "setor_empresa", "descricao_produtos", "apresentacao", "endereco", "municipio"].includes(k)) && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="contato" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                  Contato e Redes
                  {Object.keys(errors.empresa || {}).some(k => ["email", "telefone"].includes(k)) && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="produtos" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                  Produtos
                  {errors.produtos && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="max-h-[60vh] overflow-y-auto px-1">
                <TabsContent value="empresa" className="mt-0 focus-visible:outline-none">
                  <EmpresaFormAdmin />
                  <div className="mt-8 flex justify-end">
                    <Button type="button" onClick={() => handleTabChange("contato")} className="rounded-xl h-12 px-8 font-bold">
                      Próximo Passo
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="contato" className="mt-0 focus-visible:outline-none">
                  <RedesSociaisForm />
                  <div className="mt-8 flex justify-between gap-4">
                    <Button type="button" variant="outline" onClick={() => handleTabChange("empresa")} className="rounded-xl h-12 px-8 font-bold">
                      Voltar
                    </Button>
                    <Button type="button" onClick={() => handleTabChange("produtos")} className="rounded-xl h-12 px-8 font-bold">
                      Próximo Passo
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="produtos" className="mt-0 focus-visible:outline-none">
                  <ProdutosForm />
                  <div className="mt-8 flex justify-between gap-4">
                    <Button type="button" variant="outline" onClick={() => handleTabChange("contato")} className="rounded-xl h-12 px-8 font-bold">
                      Voltar
                    </Button>
                    <Button 
                      type="button" 
                      onClick={methods.handleSubmit((data) => isEditing ? handleUpdateEmpresa(data) : handleCreateEmpresa(data))} 
                      disabled={creatingEmpresa || updatingCompany} 
                      className="rounded-xl h-12 px-8 font-bold bg-slate-900"
                    >
                      {creatingEmpresa || updatingCompany ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        isEditing ? "Salvar Alterações" : "Concluir Cadastro"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
        <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-primary" />
              Novo Administrador
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Nome Completo *</Label>
              <Input
                className="rounded-xl"
                placeholder="Ex: João Silva"
                value={novoAdmin.nome}
                onChange={e => setNovoAdmin({ ...novoAdmin, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">E-mail *</Label>
              <Input
                type="email"
                className="rounded-xl"
                placeholder="email@exemplo.com"
                value={novoAdmin.email}
                onChange={e => setNovoAdmin({ ...novoAdmin, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Cargo / Função</Label>
              <Input
                className="rounded-xl"
                placeholder="Ex: Moderador, Gestor SEICT"
                value={novoAdmin.cargo}
                onChange={e => setNovoAdmin({ ...novoAdmin, cargo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400">Senha *</Label>
                <Input
                  type="password"
                  className="rounded-xl"
                  value={novoAdmin.password}
                  onChange={e => setNovoAdmin({ ...novoAdmin, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400">Confirmar *</Label>
                <Input
                  type="password"
                  className="rounded-xl"
                  value={novoAdmin.confirmPassword}
                  onChange={e => setNovoAdmin({ ...novoAdmin, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreateAdmin}
              disabled={creatingAdmin}
              className="w-full rounded-xl bg-slate-900 h-12 font-bold shadow-lg shadow-slate-900/20"
            >
              {creatingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Administrador"
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl p-8 border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 mt-2">
              Você está prestes a excluir permanentemente <span className="font-bold text-slate-900">"{companyToDelete?.nome_fantasia}"</span>. 
              Esta ação não pode ser desfeita e removerá todos os produtos e arquivos associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl h-12 px-6 font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                confirmDeleteCompany();
              }}
              className="rounded-xl h-12 px-6 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 border-none"
              disabled={deletingCompany}
            >
              {deletingCompany ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, Excluir Empresa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
