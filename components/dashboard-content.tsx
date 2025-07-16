"use client" // Este é um Client Component

import type React from "react"

import { useState } from "react"
import { Package, Users, BarChart3, Plus, Edit, Eye, Upload, FileText, ImageIcon, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { atualizarEmpresa } from "@/lib/database"
import type { Empresa, Produto } from "@/lib/supabase.types"
import { useToast } from "@/components/ui/use-toast"

interface DashboardContentProps {
  initialEmpresa: Empresa | null
  initialProdutos: Produto[]
  initialAnalytics: {
    totalVisualizacoes: number
    visualizacoesMes: number
    produtosMaisVistos: { nome: string; views: number }[]
  }
  isConfiguredProp: boolean
}

export function DashboardContent({
  initialEmpresa,
  initialProdutos,
  initialAnalytics,
  isConfiguredProp,
}: DashboardContentProps) {
  const { toast } = useToast()
  const [empresa, setEmpresa] = useState<Empresa | null>(initialEmpresa)
  const [produtos] = useState<Produto[]>(initialProdutos)
  const [analytics] = useState(initialAnalytics)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Empresa>>(initialEmpresa || {})

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target

    // Validação específica para CNPJ
    if (id === "cnpj") {
      // Remove caracteres não numéricos para validação
      const numericValue = value.replace(/\D/g, "")
      if (numericValue.length > 14) {
        return // Não permite mais de 14 dígitos
      }
      // Formatar CNPJ automaticamente
      let formattedValue = value
      if (numericValue.length <= 14) {
        formattedValue = numericValue
          .replace(/^(\d{2})(\d)/, "$1.$2")
          .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/\.(\d{3})(\d)/, ".$1/$2")
          .replace(/(\d{4})(\d)/, "$1-$2")
      }
      setFormData((prev) => ({ ...prev, [id]: formattedValue }))
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCancel = () => {
    setFormData(empresa || {}) // Reset form data to original empresa data
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!empresa) return

    // Validação básica dos campos obrigatórios
    const requiredFields = ["nome_fantasia", "razao_social", "cnpj", "setor_economico", "setor_empresa", "municipio"]
    const missingFields = requiredFields.filter((field) => !formData[field]?.toString().trim())

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: `Por favor, preencha os seguintes campos: ${missingFields.join(", ")}`,
        duration: 5000,
      })
      return
    }

    setLoading(true)
    try {
      const updated = await atualizarEmpresa(empresa.id, formData)
      if (updated) {
        setEmpresa(updated) // Atualiza o estado local com os dados retornados
        setIsEditing(false)
        toast({
          title: "Sucesso!",
          description: "Informações da empresa atualizadas com sucesso.",
          duration: 3000,
        })
      } else {
        throw new Error("Falha ao atualizar empresa.")
      }
    } catch (err: any) {
      console.error("Erro ao salvar empresa:", err)
      toast({
        variant: "destructive",
        title: "Erro",
        description: err.message || "Erro ao salvar informações da empresa.",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!empresa) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h1>
          <p className="text-gray-600">Não foi possível carregar os dados da sua empresa.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo, {empresa?.nome_fantasia || "Usuário"}!</h1>
        <p className="text-gray-600">Gerencie as informações da sua empresa e produtos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">+2 este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisualizacoes}</div>
            <p className="text-xs text-muted-foreground">+{analytics.visualizacoesMes} este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+8 esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary">{empresa?.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Perfil aprovado</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>Gerencie os dados básicos da sua empresa</CardDescription>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                  {isEditing ? (
                    <Input
                      id="nome_fantasia"
                      value={formData.nome_fantasia || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.nome_fantasia}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="razao_social">Razão Social *</Label>
                  {isEditing ? (
                    <Input
                      id="razao_social"
                      value={formData.razao_social || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.razao_social}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  {isEditing ? (
                    <Input id="cnpj" value={formData.cnpj || ""} onChange={handleInputChange} className="mt-1" />
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.cnpj}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="setor_economico">Setor Econômico *</Label>
                  {isEditing ? (
                    <Select
                      value={formData.setor_economico || ""}
                      onValueChange={(value) => handleSelectChange("setor_economico", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o setor econômico" />
                      </SelectTrigger>
                      <SelectContent>
                        {setoresEconomicos.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-600 mt-1">
                      {setoresEconomicos.find((s) => s.value === empresa.setor_economico)?.label ||
                        empresa.setor_economico}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="setor_empresa">Setor da Empresa *</Label>
                  {isEditing ? (
                    <Select
                      value={formData.setor_empresa || ""}
                      onValueChange={(value) => handleSelectChange("setor_empresa", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o setor da empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {setoresEmpresa.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-600 mt-1">
                      {setoresEmpresa.find((s) => s.value === empresa.setor_empresa)?.label || empresa.setor_empresa}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="municipio">Município *</Label>
                  {isEditing ? (
                    <Select
                      value={formData.municipio || ""}
                      onValueChange={(value) => handleSelectChange("municipio", value)}
                    >
                      <SelectTrigger className="mt-1">
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
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.municipio}, AC</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  {isEditing ? (
                    <Input
                      id="endereco"
                      value={formData.endereco || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.endereco || "-"}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="apresentacao">Apresentação</Label>
                  {isEditing ? (
                    <Textarea
                      id="apresentacao"
                      value={formData.apresentacao || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.apresentacao || "-"}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="descricao_produtos">Descrição dos Produtos</Label>
                  {isEditing ? (
                    <Textarea
                      id="descricao_produtos"
                      value={formData.descricao_produtos || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.descricao_produtos || "-"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  {isEditing ? (
                    <Input
                      id="instagram"
                      value={formData.instagram || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{empresa.instagram || "-"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Badge variant="secondary" className="mt-1">
                    {empresa.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Produtos Cadastrados</CardTitle>
                  <CardDescription>Gerencie os produtos da sua empresa</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Produto</TableHead>
                    <TableHead>Linha</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.linha || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={produto.status === "ativo" ? "secondary" : "outline"}>{produto.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arquivos">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentos PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">Folder Institucional.pdf</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">Catálogo de Produtos.pdf</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Imagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Imagens
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visualizações do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">1,234</div>
                <p className="text-sm text-gray-600">Visualizações nos últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Visualizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Açaí Premium</span>
                    <span className="text-sm font-medium">456 views</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Polpa de Cupuaçu</span>
                    <span className="text-sm font-medium">234 views</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Castanha do Pará</span>
                    <span className="text-sm font-medium">123 views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
