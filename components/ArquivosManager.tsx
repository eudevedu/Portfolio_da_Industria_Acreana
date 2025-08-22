'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Plus, Upload, FileText, ImageIcon } from 'lucide-react'

interface Arquivo {
  id: string
  nome: string
  url: string
  tipo: string
  categoria: string
  created_at: string
}

export default function ArquivosManager() {
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [arquivoForm, setArquivoForm] = useState({
    nome: '',
    tipo: 'pdf',
    categoria: 'documento'
  })

  useEffect(() => {
    loadArquivos()
  }, [])

  const loadArquivos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/arquivos')
      if (response.ok) {
        const data = await response.json()
        setArquivos(data.arquivos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar arquivos' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-detectar tipo do arquivo
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      // Auto-completar nome se estiver vazio
      if (!arquivoForm.nome) {
        setArquivoForm({ ...arquivoForm, nome: file.name, tipo: fileExtension })
      } else {
        setArquivoForm({ ...arquivoForm, tipo: fileExtension })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Por favor, selecione um arquivo' })
      return
    }

    try {
      setUploading(true)
      
      // Criar FormData para upload
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('nome', arquivoForm.nome)
      formData.append('tipo', arquivoForm.tipo)
      formData.append('categoria', arquivoForm.categoria)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        // Adicionar arquivo à lista com os dados retornados da API
        const novoArquivo = result.arquivo
        
        setArquivos([novoArquivo, ...arquivos])
        setArquivoForm({ nome: '', tipo: 'pdf', categoria: 'documento' })
        setSelectedFile(null)
        setShowForm(false)
        setMessage({ type: 'success', text: result.message || 'Arquivo enviado com sucesso!' })
        
        // Reset file input
        const fileInput = document.getElementById('arquivo-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao enviar arquivo' })
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error)
      setMessage({ type: 'error', text: 'Erro ao enviar arquivo' })
    } finally {
      setUploading(false)
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

  const arquivosPorTipo = arquivos.reduce((acc, arquivo) => {
    const tipoArquivo = arquivo.tipo?.toLowerCase() || ''
    const isPdf = tipoArquivo === 'pdf'
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(tipoArquivo)
    
    if (isPdf) {
      acc.pdfs.push(arquivo)
    } else if (isImage) {
      acc.imagens.push(arquivo)
    } else {
      acc.outros.push(arquivo)
    }
    
    return acc
  }, { pdfs: [] as Arquivo[], imagens: [] as Arquivo[], outros: [] as Arquivo[] })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">Carregando arquivos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={`${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gerenciar Arquivos ({arquivos.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Organize documentos, catálogos e imagens da sua empresa</p>
            </div>
            <Button onClick={() => {
              setShowForm(!showForm)
              if (showForm) {
                // Reset form when canceling
                setArquivoForm({ nome: '', tipo: 'pdf', categoria: 'documento' })
                setSelectedFile(null)
              }
            }}>
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancelar' : 'Novo Arquivo'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">Enviar Novo Arquivo</h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
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
                <div className="md:col-span-2">
                  <Label htmlFor="arquivo-file">Arquivo *</Label>
                  <div className="mt-1">
                    <Input
                      id="arquivo-file"
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                      required
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      </div>
                    )}
                  </div>
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
                <div className="flex items-end">
                  <Button type="submit" className="w-full" disabled={uploading || !selectedFile}>
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Arquivo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Documentos PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentos PDF ({arquivosPorTipo.pdfs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {arquivosPorTipo.pdfs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum PDF cadastrado</p>
              ) : (
                arquivosPorTipo.pdfs.map((arquivo, index) => (
                  <div key={arquivo.id || `pdf-${index}`} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{arquivo.nome}</div>
                      <div className="flex items-center gap-2 mt-1">
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
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteArquivo(arquivo.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Imagens ({arquivosPorTipo.imagens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {arquivosPorTipo.imagens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma imagem cadastrada</p>
                <div className="grid grid-cols-2 gap-3 opacity-50">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {arquivosPorTipo.imagens.map((arquivo, index) => (
                  <div key={arquivo.id || `imagem-${index}`} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{arquivo.nome}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{arquivo.tipo?.toUpperCase() || 'IMAGEM'}</Badge>
                        <Badge variant="outline">{arquivo.categoria}</Badge>
                      </div>
                      <a 
                        href={arquivo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                      >
                        Ver imagem →
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteArquivo(arquivo.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outros Arquivos */}
      {arquivosPorTipo.outros.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Outros Arquivos ({arquivosPorTipo.outros.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {arquivosPorTipo.outros.map((arquivo, index) => (
                <div key={arquivo.id || `outros-${index}`} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{arquivo.nome}</div>
                    <div className="flex items-center gap-2 mt-1">
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
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteArquivo(arquivo.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
