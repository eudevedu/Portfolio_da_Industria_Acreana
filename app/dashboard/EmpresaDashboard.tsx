'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Plus, FileText, Package } from 'lucide-react'

import { User } from '@/lib/supabase.types'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco?: number
  categoria?: string
  created_at: string
}

interface Arquivo {
  id: string
  nome: string
  url: string
  tipo: string
  categoria: string
  created_at: string
}

interface EmpresaDashboardProps {
  user: User
}

export default function EmpresaDashboard({ user }: EmpresaDashboardProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: ''
  })

  const [arquivoForm, setArquivoForm] = useState({
    nome: '',
    url: '',
    tipo: 'pdf',
    categoria: 'documento'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar produtos
      const produtosResponse = await fetch('/api/produtos')
      if (produtosResponse.ok) {
        const produtosData = await produtosResponse.json()
        setProdutos(produtosData.produtos || [])
      }

      // Carregar arquivos
      const arquivosResponse = await fetch('/api/arquivos')
      if (arquivosResponse.ok) {
        const arquivosData = await arquivosResponse.json()
        setArquivos(arquivosData.arquivos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar dados' })
    } finally {
      setLoading(false)
    }
  }

  const handleProdutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...produtoForm,
          preco: produtoForm.preco ? parseFloat(produtoForm.preco) : null
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setProdutos([result.produto, ...produtos])
        setProdutoForm({ nome: '', descricao: '', preco: '', categoria: '' })
        setMessage({ type: 'success', text: 'Produto adicionado com sucesso!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao adicionar produto' })
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      setMessage({ type: 'error', text: 'Erro ao adicionar produto' })
    }
  }

  const handleArquivoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/arquivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arquivoForm)
      })

      const result = await response.json()
      
      if (result.success) {
        setArquivos([result.arquivo, ...arquivos])
        setArquivoForm({ nome: '', url: '', tipo: 'pdf', categoria: 'documento' })
        setMessage({ type: 'success', text: 'Arquivo adicionado com sucesso!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao adicionar arquivo' })
      }
    } catch (error) {
      console.error('Erro ao adicionar arquivo:', error)
      setMessage({ type: 'error', text: 'Erro ao adicionar arquivo' })
    }
  }

  const deleteProduto = async (id: string) => {
    try {
      const response = await fetch(`/api/produtos?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        setProdutos(produtos.filter(p => p.id !== id))
        setMessage({ type: 'success', text: 'Produto removido com sucesso!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao remover produto' })
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error)
      setMessage({ type: 'error', text: 'Erro ao remover produto' })
    }
  }

  const deleteArquivo = async (id: string) => {
    try {
      const response = await fetch(`/api/arquivos?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        setArquivos(arquivos.filter(a => a.id !== id))
        setMessage({ type: 'success', text: 'Arquivo removido com sucesso!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao remover arquivo' })
      }
    } catch (error) {
      console.error('Erro ao remover arquivo:', error)
      setMessage({ type: 'error', text: 'Erro ao remover arquivo' })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard da Empresa</h1>
      <p className="text-gray-600 mb-8">Bem-vindo(a), {user.email}!</p>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="arquivos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Arquivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProdutoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Produto *</Label>
                    <Input
                      id="nome"
                      value={produtoForm.nome}
                      onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={produtoForm.descricao}
                      onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={produtoForm.preco}
                      onChange={(e) => setProdutoForm({ ...produtoForm, preco: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select 
                      value={produtoForm.categoria} 
                      onValueChange={(value) => setProdutoForm({ ...produtoForm, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alimentos">Alimentos</SelectItem>
                        <SelectItem value="madeira">Madeira</SelectItem>
                        <SelectItem value="textil">Têxtil</SelectItem>
                        <SelectItem value="plastico">Plástico</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Adicionar Produto</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados ({produtos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {produtos.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum produto cadastrado</p>
                  ) : (
                    produtos.map((produto) => (
                      <div key={produto.id} className="border rounded-lg p-3 flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{produto.nome}</h4>
                          {produto.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{produto.descricao}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {produto.preco && (
                              <Badge variant="secondary">
                                R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Badge>
                            )}
                            {produto.categoria && (
                              <Badge variant="outline">{produto.categoria}</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduto(produto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="arquivos" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleArquivoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="arquivo-nome">Nome do Arquivo *</Label>
                    <Input
                      id="arquivo-nome"
                      value={arquivoForm.nome}
                      onChange={(e) => setArquivoForm({ ...arquivoForm, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="arquivo-url">URL do Arquivo *</Label>
                    <Input
                      id="arquivo-url"
                      type="url"
                      value={arquivoForm.url}
                      onChange={(e) => setArquivoForm({ ...arquivoForm, url: e.target.value })}
                      placeholder="https://exemplo.com/arquivo.pdf"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="arquivo-tipo">Tipo</Label>
                    <Select 
                      value={arquivoForm.tipo} 
                      onValueChange={(value) => setArquivoForm({ ...arquivoForm, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="doc">DOC</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="xls">XLS</SelectItem>
                        <SelectItem value="xlsx">XLSX</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="arquivo-categoria">Categoria</Label>
                    <Select 
                      value={arquivoForm.categoria} 
                      onValueChange={(value) => setArquivoForm({ ...arquivoForm, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="documento">Documento</SelectItem>
                        <SelectItem value="catalogo">Catálogo</SelectItem>
                        <SelectItem value="certificado">Certificado</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="apresentacao">Apresentação</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Adicionar Arquivo</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Arquivos Cadastrados ({arquivos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {arquivos.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum arquivo cadastrado</p>
                  ) : (
                    arquivos.map((arquivo) => (
                      <div key={arquivo.id} className="border rounded-lg p-3 flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{arquivo.nome}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{arquivo.tipo?.toUpperCase() || 'ARQUIVO'}</Badge>
                            <Badge variant="outline">{arquivo.categoria}</Badge>
                          </div>
                          <a 
                            href={arquivo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                          >
                            Abrir arquivo →
                          </a>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteArquivo(arquivo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Exemplo de renderização */}
      <ul>
        {arquivos.map(arquivo => (
          <li key={arquivo.id}>
            <a href={arquivo.url} target="_blank" rel="noopener noreferrer">
              {arquivo.nome}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

