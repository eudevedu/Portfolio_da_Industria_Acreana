"use client" // Este é um Client Component

import Link from "next/link"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Edit,
  Save,
  X,
  Package,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  ChevronLeft,
  Eye,
  FileText,
  ImageIcon,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { atualizarEmpresa } from "@/lib/database"
import type { Empresa } from "@/lib/supabase.types"
import { formatBrazilianDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast" // Importa o hook useToast

interface EmpresaDetailAdminContentProps {
  initialEmpresa: Empresa
  isConfiguredProp: boolean
}

export function EmpresaDetailAdminContent({ initialEmpresa, isConfiguredProp }: EmpresaDetailAdminContentProps) {
  const router = useRouter()
  const { toast } = useToast() // Inicializa o toast
  const [empresa, setEmpresa] = useState<Empresa>(initialEmpresa)
  const [loading, setLoading] = useState(false) // Este loading é para o salvamento client-side
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Empresa>>(initialEmpresa)

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
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-500">
            Ativo
          </Badge>
        )
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>
      case "inativo":
        return <Badge variant="destructive">Inativo</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      {!isConfiguredProp && (
        <div className="bg-yellow-100 border-yellow-500 text-yellow-700 px-4 py-3" role="alert">
          <strong className="font-bold">Atenção:</strong>
          <span className="block sm:inline">
            Banco de dados não configurado. Os dados exibidos são de demonstração.
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5 mr-2" />
            Voltar para Empresas
          </Button>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
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
              Editar Empresa
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{empresa.nome_fantasia}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {empresa.razao_social} {getStatusBadge(empresa.status)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                {isEditing ? (
                  <Input id="nome_fantasia" value={formData.nome_fantasia || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">{empresa.nome_fantasia}</p>
                )}
              </div>
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                {isEditing ? (
                  <Input id="razao_social" value={formData.razao_social || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">{empresa.razao_social}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                {isEditing ? (
                  <Input id="cnpj" value={formData.cnpj || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">{empresa.cnpj}</p>
                )}
              </div>
              <div>
                <Label htmlFor="setor_economico">Setor Econômico</Label>
                {isEditing ? (
                  <Select
                    value={formData.setor_economico || ""}
                    onValueChange={(value) => handleSelectChange("setor_economico", value)}
                  >
                    <SelectTrigger>
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
                  <p className="text-gray-700">
                    {setoresEconomicos.find((s) => s.value === empresa.setor_economico)?.label ||
                      empresa.setor_economico}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="setor_empresa">Setor da Empresa</Label>
                {isEditing ? (
                  <Select
                    value={formData.setor_empresa || ""}
                    onValueChange={(value) => handleSelectChange("setor_empresa", value)}
                  >
                    <SelectTrigger>
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
                  <p className="text-gray-700">
                    {setoresEmpresa.find((s) => s.value === empresa.setor_empresa)?.label || empresa.setor_empresa}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="segmento">Segmento</Label>
                {isEditing ? (
                  <Input id="segmento" value={formData.segmento || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">{empresa.segmento || "-"}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tema_segmento">Tema do Segmento</Label>
                {isEditing ? (
                  <Input id="tema_segmento" value={formData.tema_segmento || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">{empresa.tema_segmento || "-"}</p>
                )}
              </div>
              <div>
                <Label htmlFor="municipio">Município</Label>
                {isEditing ? (
                  <Select
                    value={formData.municipio || ""}
                    onValueChange={(value) => handleSelectChange("municipio", value)}
                  >
                    <SelectTrigger>
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
                  <p className="text-gray-700">{empresa.municipio}, AC</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                {isEditing ? (
                  <Input id="endereco" value={formData.endereco || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">{empresa.endereco || "-"}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="apresentacao">Apresentação da Empresa</Label>
                {isEditing ? (
                  <Textarea
                    id="apresentacao"
                    value={formData.apresentacao || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{empresa.apresentacao || "-"}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="descricao_produtos">Descrição Geral dos Produtos/Serviços</Label>
                {isEditing ? (
                  <Textarea
                    id="descricao_produtos"
                    value={formData.descricao_produtos || ""}
                    onChange={handleInputChange}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{empresa.descricao_produtos || "-"}</p>
                )}
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                {isEditing ? (
                  <Input id="instagram" value={formData.instagram || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">
                    {empresa.instagram ? (
                      <a
                        href={`https://instagram.com/${empresa.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Instagram className="h-4 w-4" />
                        {empresa.instagram}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                {isEditing ? (
                  <Input id="facebook" value={formData.facebook || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">
                    {empresa.facebook ? (
                      <a
                        href={empresa.facebook.startsWith("http") ? empresa.facebook : `https://${empresa.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Facebook className="h-4 w-4" />
                        {empresa.facebook}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                {isEditing ? (
                  <Input id="youtube" value={formData.youtube || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">
                    {empresa.youtube ? (
                      <a
                        href={empresa.youtube.startsWith("http") ? empresa.youtube : `https://${empresa.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Youtube className="h-4 w-4" />
                        {empresa.youtube}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                {isEditing ? (
                  <Input id="linkedin" value={formData.linkedin || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">
                    {empresa.linkedin ? (
                      <a
                        href={empresa.linkedin.startsWith("http") ? empresa.linkedin : `https://${empresa.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Linkedin className="h-4 w-4" />
                        {empresa.linkedin}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="twitter">X (Twitter)</Label>
                {isEditing ? (
                  <Input id="twitter" value={formData.twitter || ""} onChange={handleInputChange} />
                ) : (
                  <p className="text-gray-700">
                    {empresa.twitter ? (
                      <a
                        href={empresa.twitter.startsWith("http") ? empresa.twitter : `https://${empresa.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Twitter className="h-4 w-4" />X (Twitter)
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="video_apresentacao">Vídeo de Apresentação (YouTube URL)</Label>
                {isEditing ? (
                  <Input
                    id="video_apresentacao"
                    value={formData.video_apresentacao || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-gray-700">
                    {empresa.video_apresentacao ? (
                      <a
                        href={empresa.video_apresentacao}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Youtube className="h-4 w-4" />
                        {empresa.video_apresentacao}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="created_at">Data de Cadastro</Label>
                <p className="text-gray-700">{formatBrazilianDate(empresa.created_at)}</p>
              </div>
              <div>
                <Label htmlFor="updated_at">Última Atualização</Label>
                <p className="text-gray-700">{formatBrazilianDate(empresa.updated_at)}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-8">Produtos Cadastrados</h3>
            {empresa.produtos && empresa.produtos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empresa.produtos.map((produto) => (
                  <Card key={produto.id} className="p-4">
                    <CardTitle className="text-md flex items-center gap-2">
                      <Package className="h-4 w-4" /> {produto.nome}
                    </CardTitle>
                    <CardDescription className="text-sm">{produto.linha}</CardDescription>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{produto.descricao}</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" disabled>
                        <Edit className="h-3 w-3 mr-1" /> Editar
                      </Button>
                      <Link href={`/empresas/${empresa.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" /> Ver
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Nenhum produto cadastrado para esta empresa.</p>
            )}

            <h3 className="text-lg font-semibold text-gray-800 mt-8">Arquivos Anexados</h3>
            {empresa.arquivos && empresa.arquivos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empresa.arquivos.map((arquivo) => (
                  <Card key={arquivo.id} className="p-4">
                    <CardTitle className="text-md flex items-center gap-2">
                      {arquivo.tipo === "pdf" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                      {arquivo.nome}
                    </CardTitle>
                    <CardDescription className="text-sm">Categoria: {arquivo.categoria}</CardDescription>
                    <div className="flex gap-2 mt-3">
                      <a href={arquivo.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" /> Visualizar
                        </Button>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Nenhum arquivo anexado para esta empresa.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
