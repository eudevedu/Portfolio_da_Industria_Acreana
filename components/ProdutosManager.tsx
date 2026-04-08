'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Plus, Edit, Eye, ImageIcon } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UploadComponent } from '@/components/upload-component' // Importando o componente de upload

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco?: number
  linha?: string // Alinhado com o banco de dados
  imagem_url?: string // Nova propriedade para a foto do produto
  status: string
  created_at: string
}

export default function ProdutosManager() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    linha: 'Geral',
    imagem_url: '',
    status: 'ativo'
  })

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/produtos')
      if (response.ok) {
        const data = await response.json()
        setProdutos(data.produtos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar produtos' })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (url: string) => {
    setProdutoForm(prev => ({ ...prev, imagem_url: url }))
    setMessage({ type: 'success', text: 'Foto do produto enviada com sucesso!' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
        setProdutoForm({ nome: '', descricao: '', preco: '', linha: 'Geral', imagem_url: '', status: 'ativo' })
        setShowForm(false)
        setMessage({ type: 'success', text: 'Produto adicionado com sucesso!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao adicionar produto' })
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      setMessage({ type: 'error', text: 'Erro ao adicionar produto' })
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">Carregando produtos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={`${message.type === 'error' ? 'border-red-500' : 'border-green-500'} animate-in fade-in slide-in-from-top-4 duration-500`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-display font-black tracking-tight">Portfólio de Produtos ({produtos.length})</CardTitle>
              <p className="text-sm text-slate-500 font-medium mt-1">Gerencie o que sua vitrine industrial exibe para o portal</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className={`rounded-xl h-11 transition-all ${showForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-green-600 hover:bg-green-700'}`}>
              <Plus className={`h-4 w-4 mr-2 transition-transform ${showForm ? 'rotate-45' : ''}`} />
              {showForm ? 'Cancelar' : 'Novo Produto'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {showForm && (
            <div className="mb-10 p-8 border border-slate-100 rounded-[2rem] bg-slate-50/30 animate-in zoom-in-95 duration-300">
              <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-400">Dados do Novo Produto</h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-12 gap-8">
                {/* Imagem do Produto */}
                <div className="md:col-span-5 space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Foto do Produto</Label>
                  {produtoForm.imagem_url ? (
                    <div className="relative aspect-square w-full rounded-3xl overflow-hidden border-2 border-green-100 group">
                      <img 
                        src={produtoForm.imagem_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        className="absolute bottom-4 right-4 h-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setProdutoForm(prev => ({ ...prev, imagem_url: '' }))}
                      >
                        Trocar Foto
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 mb-6 px-4">Utilize fotos de alta qualidade com fundo neutro para melhor destaque</p>
                      <UploadComponent 
                        onUploadSuccess={handleUploadSuccess} 
                        buttonText="Selecionar Foto"
                      />
                    </div>
                  )}
                </div>

                {/* Detalhes do Produto */}
                <div className="md:col-span-7 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="nome" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nome Comercial *</Label>
                      <Input
                        id="nome"
                        className="rounded-xl h-12 mt-1"
                        placeholder="Ex: Telha Ecológica Premium"
                        value={produtoForm.nome}
                        onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="linha" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Linha / Categoria</Label>
                      <Select 
                        value={produtoForm.linha} 
                        onValueChange={(value) => setProdutoForm({ ...produtoForm, linha: value })}
                      >
                        <SelectTrigger className="rounded-xl h-12 mt-1">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Geral">Linha Geral</SelectItem>
                          <SelectItem value="Premium">Série Premium</SelectItem>
                          <SelectItem value="Economica">Linha Econômica</SelectItem>
                          <SelectItem value="Sustentavel">Ecológico / Sustentável</SelectItem>
                          <SelectItem value="Industrial">Uso Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preco" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Valor Estimado (R$)</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        className="rounded-xl h-12 mt-1"
                        value={produtoForm.preco}
                        onChange={(e) => setProdutoForm({ ...produtoForm, preco: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Breve Descrição do Produto</Label>
                    <Textarea
                      id="descricao"
                      className="rounded-2xl mt-1 min-h-[120px]"
                      placeholder="Descreva as principais características e benefícios deste item..."
                      value={produtoForm.descricao}
                      onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })}
                    />
                  </div>

                  <div className="flex pt-4">
                    <Button type="submit" className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 font-black text-sm uppercase tracking-widest" disabled={!produtoForm.nome}>
                      Salvar Cadastro do Produto
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {produtos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhum produto cadastrado</p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-20 text-xs font-bold uppercase tracking-widest text-slate-400">Foto</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Produto / Descrição</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Linha</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Valoração</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.filter(p => p !== null).map((produto) => (
                  <TableRow key={produto.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                    <TableCell>
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        {produto.imagem_url ? (
                          <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-bold text-slate-900">{produto.nome}</div>
                        {produto.descricao && (
                          <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                            {produto.descricao}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        {produto.linha || "Geral"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {produto.preco ? (
                        <div className="font-black text-slate-900 text-sm">
                          R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">Sob consulta</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteProduto(produto.id)}
                          className="h-9 w-9 rounded-xl hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
