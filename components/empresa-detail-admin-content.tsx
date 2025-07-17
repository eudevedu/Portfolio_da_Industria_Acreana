"use client"

import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Edit, Save, X, Package, Instagram, Facebook, Youtube, Linkedin, Twitter,
  ChevronLeft, Eye, FileText, ImageIcon, ExternalLink,
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
import { useToast } from "@/components/ui/use-toast"

interface EmpresaDetailAdminContentProps {
  initialEmpresa: Empresa
  isConfiguredProp: boolean
}

export function EmpresaDetailAdminContent({ initialEmpresa, isConfiguredProp }: EmpresaDetailAdminContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [empresa, setEmpresa] = useState<Empresa>(initialEmpresa)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Empresa>>(initialEmpresa)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { id, value } = e.target
  setFormData((prev) => ({ ...prev, [id]: value }))
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

  // ...existing code for arrays and handlers...

  // ...existing code for getStatusBadge...

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
        {/* ...existing code for header and edit/save buttons... */}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{empresa.nome_fantasia}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {empresa.razao_social} {getStatusBadge(empresa.status)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ...existing code for form fields... */}

            {/* Redes sociais - exemplo para Instagram */}
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
            {/* Repita o padrão para outras redes sociais... */}

            {/* Produtos Cadastrados */}
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

            {/* Arquivos Anexados */}
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