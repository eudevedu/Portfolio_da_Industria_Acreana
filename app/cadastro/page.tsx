"use client"

import { useState } from "react"
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadComponent } from "@/components/upload-component"
import { criarEmpresa, criarProduto, criarArquivo, vincularEmpresaAoPerfil } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Empresa, Produto } from "@/lib/supabase.types"
import { useToast } from "@/components/ui/use-toast"
import { register } from "@/lib/auth"

export default function CadastroPage() {
  const { toast } = useToast()
  const [produtos, setProdutos] = useState<
    Array<
      Partial<Produto> & {
        id: number
        ficha_tecnica_url?: string
        folder_produto_url?: string
        imagens_produto_urls?: string[]
        video_produto?: string
      }
    >
  >([])
  const [currentTab, setCurrentTab] = useState("acesso") // Começa na aba de acesso
  const [formData, setFormData] = useState<Partial<Empresa>>({
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    setor_economico: "",
    setor_empresa: "",
    segmento: "",
    tema_segmento: "",
    descricao_produtos: "",
    apresentacao: "",
    endereco: "",
    municipio: "",
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    twitter: "",
    video_apresentacao: "",
    status: "pendente",
  })
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactRole, setContactRole] = useState("")

  const [loading, setLoading] = useState(false)
  const [isConfigured] = useState(isSupabaseConfigured())
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // State for main company files
  const [folderApresentacaoUrl, setFolderApresentacaoUrl] = useState<string | null>(null)
  const [outrosArquivosUrls, setOutrosArquivosUrls] = useState<string[]>([])

  const setoresEconomicos = [
    { value: "industria", label: "Indústria" },
    { value: "agroindustria", label: "Agroindústria" },
    { value: "servicos", label: "Serviços" },
    { value: "comercio", label: "Comércio" },
  ]

  const setoresEmpresa = [
    { value: "alimentos", label: "Alimentos e Bebidas" },
    { value: "madeira", label: "Madeira e Móveis" },
    { value: "construcao", label: "Construção Civil" },
    { value: "tecnologia", label: "Tecnologia" },
    { value: "textil", label: "Têxtil" },
    { value: "outros", label: "Outros" },
  ]

  const municipios = [
    { value: "Rio Branco", label: "Rio Branco" },
    { value: "Cruzeiro do Sul", label: "Cruzeiro do Sul" },
    { value: "Sena Madureira", label: "Sena Madureira" },
    { value: "Feijo", label: "Feijó" },
    { value: "Tarauaca", label: "Tarauaca" },
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

  const requiredCompanyFields = [
    "nome_fantasia",
    "razao_social",
    "cnpj",
    "setor_economico",
    "setor_empresa",
    "descricao_produtos",
    "apresentacao",
    "endereco",
    "municipio",
  ]

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Validate user access fields
    if (!userEmail) errors.userEmail = "Email é obrigatório."
    if (!userPassword) errors.userPassword = "Senha é obrigatória."
    if (userPassword.length < 6) errors.userPassword = "A senha deve ter no mínimo 6 caracteres."
    if (userPassword !== confirmPassword) errors.confirmPassword = "As senhas não coincidem."
    if (!contactName) errors.contactName = "Nome do contato é obrigatório."

    // Validate company fields
    requiredCompanyFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "Este campo é obrigatório."
      }
    })

    // Basic CNPJ validation (format XX.XXX.XXX/XXXX-XX)
    if (formData.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      errors.cnpj = "Formato de CNPJ inválido (ex: 00.000.000/0000-00)."
    }

    // Validate products
    produtos.forEach((produto, index) => {
      if (!produto.nome) {
        errors[`produto_nome_${index}`] = "Nome do produto é obrigatório."
      }
      if (!produto.descricao) {
        errors[`produto_descricao_${index}`] = "Descrição do produto é obrigatória."
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSalvarEmpresa = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios e corrija os erros.",
      })
      // Set current tab to the first one with errors
      if (
        validationErrors.userEmail ||
        validationErrors.userPassword ||
        validationErrors.confirmPassword ||
        validationErrors.contactName
      ) {
        setCurrentTab("acesso")
      } else if (Object.keys(validationErrors).some((key) => requiredCompanyFields.includes(key))) {
        setCurrentTab("empresa")
      } else if (Object.keys(validationErrors).some((key) => key.startsWith("produto_"))) {
        setCurrentTab("produtos")
      }
      return
    }

    setLoading(true)
    try {
      // 1. Register user
      const registerResult = await register(userEmail, userPassword, "empresa", contactName, contactPhone, contactRole)
      if (!registerResult.success) {
        throw new Error(registerResult.message)
      }
      const userId = registerResult.userId

      if (!userId) {
        throw new Error("ID do usuário não retornado após o registro.")
      }

      // 2. Create company
      const empresa = await criarEmpresa(formData as Omit<Empresa, "id" | "created_at" | "updated_at" | "status">)

      if (!empresa) {
        throw new Error("Falha ao criar empresa.")
      }

      // 3. Link company to user profile
      const { success: linkSuccess, error: linkError } = await vincularEmpresaAoPerfil(userId, empresa.id)
      if (!linkSuccess) {
        throw new Error(linkError?.message || "Falha ao vincular empresa ao perfil do usuário.")
      }

      // 4. Save products
      for (const produto of produtos) {
        if (produto.nome) {
          const novoProduto = await criarProduto({
            empresa_id: empresa.id,
            nome: produto.nome!,
            nome_tecnico: produto.nome_tecnico,
            linha: produto.linha,
            descricao: produto.descricao,
            status: produto.status || "ativo",
          })

          if (novoProduto) {
            // Save product-specific files
            if (produto.ficha_tecnica_url) {
              await criarArquivo({
                empresa_id: empresa.id,
                nome: `Ficha Técnica - ${produto.nome}`,
                url: produto.ficha_tecnica_url,
                tipo: "pdf",
                categoria: "produto_ficha_tecnica",
              })
            }
            if (produto.folder_produto_url) {
              await criarArquivo({
                empresa_id: empresa.id,
                nome: `Folder Produto - ${produto.nome}`,
                url: produto.folder_produto_url,
                tipo: "pdf",
                categoria: "produto_folder",
              })
            }
            if (produto.imagens_produto_urls && produto.imagens_produto_urls.length > 0) {
              for (const imageUrl of produto.imagens_produto_urls) {
                await criarArquivo({
                  empresa_id: empresa.id,
                  nome: `Imagem Produto - ${produto.nome}`,
                  url: imageUrl,
                  tipo: "imagem",
                  categoria: "produto_imagem",
                })
              }
            }
          }
        }
      }

      // 5. Save company files
      if (folderApresentacaoUrl) {
        await criarArquivo({
          empresa_id: empresa.id,
          nome: "Folder de Apresentação",
          url: folderApresentacaoUrl,
          tipo: "pdf",
          categoria: "institucional_folder",
        })
      }
      if (outrosArquivosUrls.length > 0) {
        for (const url of outrosArquivosUrls) {
          await criarArquivo({
            empresa_id: empresa.id,
            nome: "Outro Arquivo da Empresa", // Generic name, can be improved
            url: url,
            tipo: url.endsWith(".pdf") ? "pdf" : "imagem", // Infer type
            categoria: "institucional_outros",
          })
        }
      }

      toast({
        title: "Sucesso!",
        description: "Empresa e conta de usuário cadastrados com sucesso! Você será redirecionado para o login.",
        duration: 8000, // Aumenta a duração para 8 segundos
      })
      // Clear form and redirect
      setFormData({
        nome_fantasia: "",
        razao_social: "",
        cnpj: "",
        setor_economico: "",
        setor_empresa: "",
        segmento: "",
        tema_segmento: "",
        descricao_produtos: "",
        apresentacao: "",
        endereco: "",
        municipio: "",
        instagram: "",
        facebook: "",
        youtube: "",
        linkedin: "",
        twitter: "",
        video_apresentacao: "",
        status: "pendente",
      })
      setUserEmail("")
      setUserPassword("")
      setConfirmPassword("")
      setContactName("")
      setContactPhone("")
      setContactRole("")
      setProdutos([])
      setFolderApresentacaoUrl(null)
      setOutrosArquivosUrls([])
      setValidationErrors({})
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/login" // Use window.location for full page reload after registration
      }, 2000)
    } catch (err: any) {
      console.error("Erro ao cadastrar empresa:", err)
      toast({
        variant: "destructive",
        title: "Erro no Cadastro",
        description: err.message || "Erro ao cadastrar empresa. Tente novamente.",
        duration: 8000, // Aumenta a duração para 8 segundos
      })
    } finally {
      setLoading(false)
    }
  }

  const adicionarProduto = () => {
    setProdutos([...produtos, { id: Date.now() }]) // Use Date.now() for unique ID
  }

  const removerProduto = (id: number) => {
    setProdutos(produtos.filter((produto) => produto.id !== id))
  }

  const handleProductChange = (index: number, field: keyof Produto, value: string) => {
    const newProdutos = [...produtos]
    newProdutos[index] = { ...newProdutos[index], [field]: value } // Ensure immutability
    setProdutos(newProdutos)
  }

  const handleProductFileUpload = (index: number, field: "ficha_tecnica_url" | "folder_produto_url", url: string) => {
    const newProdutos = [...produtos]
    newProdutos[index] = { ...newProdutos[index], [field]: url }
    setProdutos(newProdutos)
  }

  const handleProductImagesUpload = (index: number, url: string) => {
    const newProdutos = [...produtos]
    if (!newProdutos[index].imagens_produto_urls) {
      newProdutos[index].imagens_produto_urls = []
    }
    newProdutos[index].imagens_produto_urls.push(url)
    setProdutos(newProdutos)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">Cadastro de Empresa</h1>
          </div>
        </div>
      </header>
      {!isConfigured && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Modo de Demonstração</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    O Supabase não está configurado. Os dados serão simulados para demonstração. Para usar a
                    funcionalidade completa, configure as variáveis de ambiente do Supabase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Empresa</CardTitle>
            <CardDescription>Preencha as informações da sua empresa para aparecer na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="acesso">Dados de Acesso</TabsTrigger>
                <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
                <TabsTrigger value="contato">Contato e Redes</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
              </TabsList>
              <TabsContent value="acesso" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userEmail">Email *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value)
                        setValidationErrors((prev) => ({ ...prev, userEmail: "" }))
                      }}
                      required
                    />
                    {validationErrors.userEmail && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.userEmail}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="userPassword">Senha *</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      placeholder="********"
                      value={userPassword}
                      onChange={(e) => {
                        setUserPassword(e.target.value)
                        setValidationErrors((prev) => ({ ...prev, userPassword: "" }))
                      }}
                      required
                    />
                    {validationErrors.userPassword && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.userPassword}</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setValidationErrors((prev) => ({ ...prev, confirmPassword: "" }))
                      }}
                      required
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="contactName">Nome do Contato *</Label>
                    <Input
                      id="contactName"
                      placeholder="Nome completo do responsável"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value)
                        setValidationErrors((prev) => ({ ...prev, contactName: "" }))
                      }}
                      required
                    />
                    {validationErrors.contactName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.contactName}</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">Telefone do Contato</Label>
                    <Input
                      id="contactPhone"
                      placeholder="(XX) XXXXX-XXXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactRole">Cargo do Contato</Label>
                    <Input
                      id="contactRole"
                      placeholder="Ex: Diretor, Gerente"
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="empresa" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                    <Input
                      id="nome_fantasia"
                      placeholder="Nome comercial da empresa"
                      value={formData.nome_fantasia || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, nome_fantasia: e.target.value })
                        setValidationErrors((prev) => ({ ...prev, nome_fantasia: "" }))
                      }}
                      required
                    />
                    {validationErrors.nome_fantasia && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.nome_fantasia}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="razao_social">Razão Social *</Label>
                    <Input
                      id="razao_social"
                      placeholder="Razão social completa"
                      value={formData.razao_social || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, razao_social: e.target.value })
                        setValidationErrors((prev) => ({ ...prev, razao_social: "" }))
                      }}
                      required
                    />
                    {validationErrors.razao_social && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.razao_social}</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, cnpj: e.target.value })
                        setValidationErrors((prev) => ({ ...prev, cnpj: "" }))
                      }}
                      required
                    />
                    {validationErrors.cnpj && <p className="text-red-500 text-xs mt-1">{validationErrors.cnpj}</p>}
                  </div>
                  <div>
                    <Label htmlFor="setor_economico">Setor Econômico *</Label>
                    <Select
                      value={formData.setor_economico || ""}
                      onValueChange={(value) => {
                        setFormData({ ...formData, setor_economico: value })
                        setValidationErrors((prev) => ({ ...prev, setor_economico: "" }))
                      }}
                      required
                    >
                      <SelectTrigger id="setor_economico">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="industria">Indústria</SelectItem>
                        <SelectItem value="comercio">Comércio</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="agropecuaria">Agropecuária</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.setor_economico && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.setor_economico}</p>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="setor_empresa">Setor da Empresa *</Label>
                    <Select
                      value={formData.setor_empresa || ""}
                      onValueChange={(value) => {
                        setFormData({ ...formData, setor_empresa: value })
                        setValidationErrors((prev) => ({ ...prev, setor_empresa: "" }))
                      }}
                      required
                    >
                      <SelectTrigger id="setor_empresa">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alimentos">Alimentos</SelectItem>
                        <SelectItem value="construcao">Construção</SelectItem>
                        <SelectItem value="ceramico">Cerâmico</SelectItem>
                        <SelectItem value="madeira">Madeira</SelectItem>
                        <SelectItem value="grafico">Gráfico</SelectItem>
                        <SelectItem value="textil">Têxtil</SelectItem>
                        <SelectItem value="metalurgico">Metalúrgico</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.setor_empresa && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.setor_empresa}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="segmento">Segmento da Empresa</Label>
                    <Input
                      id="segmento"
                      placeholder="Ex: Processamento de alimentos"
                      value={formData.segmento || ""}
                      onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tema_segmento">Tema do Segmento</Label>
                  <Input
                    id="tema_segmento"
                    placeholder="Ex: Alimentos - Açaí, Alimentos - Sorvetes"
                    value={formData.tema_segmento || ""}
                    onChange={(e) => setFormData({ ...formData, tema_segmento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="descricao_produtos">Descrição dos Produtos *</Label>
                  <Textarea
                    id="descricao_produtos"
                    placeholder="Descreva sucintamente os produtos da sua indústria"
                    rows={3}
                    value={formData.descricao_produtos || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, descricao_produtos: e.target.value })
                      setValidationErrors((prev) => ({ ...prev, descricao_produtos: "" }))
                    }}
                    required
                  />
                  {validationErrors.descricao_produtos && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.descricao_produtos}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="apresentacao">Texto de Apresentação *</Label>
                  <Textarea
                    id="apresentacao"
                    placeholder="Breve texto de apresentação da indústria"
                    rows={4}
                    value={formData.apresentacao || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, apresentacao: e.target.value })
                      setValidationErrors((prev) => ({ ...prev, apresentacao: "" }))
                    }}
                    required
                  />
                  {validationErrors.apresentacao && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.apresentacao}</p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endereco">Endereço Completo *</Label>
                    <Textarea
                      id="endereco"
                      placeholder="Rua, número, bairro, CEP"
                      rows={2}
                      value={formData.endereco || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, endereco: e.target.value })
                        setValidationErrors((prev) => ({ ...prev, endereco: "" }))
                      }}
                      required
                    />
                    {validationErrors.endereco && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.endereco}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="municipio">Município *</Label>
                    <Select
                      value={formData.municipio || ""}
                      onValueChange={(value) => {
                        setFormData({ ...formData, municipio: value })
                        setValidationErrors((prev) => ({ ...prev, municipio: "" }))
                      }}
                      required
                    >
                      <SelectTrigger id="municipio">
                        <SelectValue placeholder="Selecione o município" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipios.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.municipio && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.municipio}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="contato" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@suaempresa"
                      value={formData.instagram || ""}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="facebook.com/suaempresa"
                      value={formData.facebook || ""}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      placeholder="youtube.com/suaempresa"
                      value={formData.youtube || ""}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="linkedin.com/company/suaempresa"
                      value={formData.linkedin || ""}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="twitter">X (Twitter)</Label>
                  <Input
                    id="twitter"
                    placeholder="@suaempresa"
                    value={formData.twitter || ""}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="video_apresentacao">Vídeo de Apresentação (YouTube)</Label>
                  <Input
                    id="video_apresentacao"
                    placeholder="Link do vídeo no YouTube"
                    value={formData.video_apresentacao || ""}
                    onChange={(e) => setFormData({ ...formData, video_apresentacao: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <Label>Folder de Apresentação (PDF)</Label>
                  <UploadComponent
                    onUploadSuccess={(url) => setFolderApresentacaoUrl(url)}
                    acceptedFileTypes="application/pdf"
                    buttonText={folderApresentacaoUrl ? "Alterar PDF" : "Upload PDF"}
                  />
                  {folderApresentacaoUrl && (
                    <p className="text-sm text-gray-600">
                      PDF atual:{" "}
                      <a href={folderApresentacaoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        Ver arquivo
                      </a>
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  <Label>Outros Arquivos (PDFs, Imagens)</Label>
                  <UploadComponent
                    onUploadSuccess={(url) => setOutrosArquivosUrls((prev) => [...prev, url])}
                    acceptedFileTypes="image/*,application/pdf"
                    buttonText="Adicionar Arquivo"
                  />
                  {outrosArquivosUrls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {outrosArquivosUrls.map((url, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          Arquivo {idx + 1}:{" "}
                          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                            Ver arquivo
                          </a>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="produtos" className="space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Produtos da Empresa</h3>
                    <p className="text-sm text-gray-600">Cadastre os produtos da sua indústria</p>
                  </div>
                  <Button onClick={adicionarProduto}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
                {produtos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum produto cadastrado ainda.</p>
                    <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {produtos.map((produto, index) => (
                      <Card key={produto.id}>
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Produto {index + 1}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => removerProduto(produto.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`nome-${index}`}>Nome do Produto *</Label>
                              <Input
                                id={`nome-${index}`}
                                placeholder="Nome comercial do produto"
                                value={produto.nome || ""}
                                onChange={(e) => {
                                  handleProductChange(index, "nome", e.target.value)
                                  setValidationErrors((prev) => ({ ...prev, [`produto_nome_${index}`]: "" }))
                                }}
                                required
                              />
                              {validationErrors[`produto_nome_${index}`] && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors[`produto_nome_${index}`]}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor={`nome_tecnico-${index}`}>Nome Técnico</Label>
                              <Input
                                id={`nome_tecnico-${index}`}
                                placeholder="Nome técnico/científico"
                                value={produto.nome_tecnico || ""}
                                onChange={(e) => handleProductChange(index, "nome_tecnico", e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`linha-${index}`}>Linha do Produto</Label>
                            <Input
                              id={`linha-${index}`}
                              placeholder="Ex: Linha Premium, Linha Econômica"
                              value={produto.linha || ""}
                              onChange={(e) => handleProductChange(index, "linha", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`descricao-${index}`}>Descrição e Especificações *</Label>
                            <Textarea
                              id={`descricao-${index}`}
                              placeholder="Descreva o produto e suas especificações"
                              rows={3}
                              value={produto.descricao || ""}
                              onChange={(e) => {
                                handleProductChange(index, "descricao", e.target.value)
                                setValidationErrors((prev) => ({ ...prev, [`produto_descricao_${index}`]: "" }))
                              }}
                              required
                            />
                            {validationErrors[`produto_descricao_${index}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`produto_descricao_${index}`]}
                              </p>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Ficha Técnica (PDF)</Label>
                              <UploadComponent
                                onUploadSuccess={(url) => handleProductFileUpload(index, "ficha_tecnica_url", url)}
                                acceptedFileTypes="application/pdf"
                                buttonText={produto.ficha_tecnica_url ? "Alterar PDF" : "Upload PDF"}
                              />
                              {produto.ficha_tecnica_url && (
                                <p className="text-sm text-gray-600">
                                  PDF atual:{" "}
                                  <a
                                    href={produto.ficha_tecnica_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    Ver arquivo
                                  </a>
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label>Folder do Produto (PDF)</Label>
                              <UploadComponent
                                onUploadSuccess={(url) => handleProductFileUpload(index, "folder_produto_url", url)}
                                acceptedFileTypes="application/pdf"
                                buttonText={produto.folder_produto_url ? "Alterar PDF" : "Upload PDF"}
                              />
                              {produto.folder_produto_url && (
                                <p className="text-sm text-gray-600">
                                  PDF atual:{" "}
                                  <a
                                    href={produto.folder_produto_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    Ver arquivo
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Imagens do Produto</Label>
                            <UploadComponent
                              onUploadSuccess={(url) => handleProductImagesUpload(index, url)}
                              acceptedFileTypes="image/*"
                              buttonText="Adicionar Imagem"
                            />
                            {produto.imagens_produto_urls && produto.imagens_produto_urls.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {produto.imagens_produto_urls.map((url, imgIdx) => (
                                  <p key={imgIdx} className="text-sm text-gray-600">
                                    Imagem {imgIdx + 1}:{" "}
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                                      Ver imagem
                                    </a>
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor={`video_produto-${index}`}>Vídeo do Produto (YouTube)</Label>
                            <Input
                              id={`video_produto-${index}`}
                              placeholder="Link do vídeo no YouTube"
                              value={produto.video_produto || ""}
                              onChange={(e) => handleProductChange(index, "video_produto", e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="outline">Salvar Rascunho</Button>
              <div className="space-x-2">
                <Button variant="outline">Visualizar</Button>
                <Button onClick={handleSalvarEmpresa} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Empresa"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
