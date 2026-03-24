'use client'

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  MapPin,
  FileText,
  ImageIcon,
  Package,
  Phone,
  Mail,
  Printer,
  Share2,
  Download,
  CheckCircle2
} from "lucide-react"
import type { Empresa } from "@/lib/supabase.types"
import ImageGallery from "./ImageGallery"

interface EmpresaDetailsModalProps {
  empresa: Empresa | null
  isOpen: boolean
  onClose: () => void
}

export default function EmpresaDetailsModal({ empresa, isOpen, onClose }: EmpresaDetailsModalProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0)

  // Reset doc index when company changes
  useEffect(() => {
    setSelectedDocIndex(0)
  }, [empresa?.id])

  if (!empresa) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-500 text-white border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-sm">Ativo</Badge>
      case "pendente":
        return <Badge variant="secondary" className="font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-sm">Pendente</Badge>
      case "inativo":
        return <Badge variant="destructive" className="font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-sm">Inativo</Badge>
      default:
        return <Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-sm">{status}</Badge>
    }
  }

  const pdfDocs = (empresa.arquivos || []).filter(a => {
    const tipo = (a.tipo || '').toLowerCase()
    const cat = (a.categoria || '').toLowerCase()
    const url = (a.url || '').toLowerCase()
    return tipo.includes('pdf') || url.endsWith('.pdf') || url.includes('/pdf/') || cat.includes('document')
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl rounded-xl overflow-hidden p-0 border border-slate-200 bg-white shadow-2xl">
        {/* Superior Header com Design Minimalista */}
        <div className="bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 text-slate-500 px-2 py-1 rounded-sm font-bold text-[9px] tracking-wider uppercase border text-center min-w-[60px]">
              ID {empresa.id.slice(0, 8).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-xl md:text-2xl font-display font-bold tracking-tight text-slate-900 leading-tight">
                {empresa.nome_fantasia}
              </DialogTitle>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{empresa.razao_social}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pr-10">
            {getStatusBadge(empresa.status)}
          </div>
        </div>

        <Tabs defaultValue="geral" className="w-full">
          <div className="bg-white px-6 border-b">
            <TabsList className="bg-transparent h-12 gap-8 p-0">
              <TabsTrigger value="geral" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-[10px] uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary">
                Geral
              </TabsTrigger>
              <TabsTrigger value="produtos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-[10px] uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary">
                Produtos
              </TabsTrigger>
              <TabsTrigger value="fotos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-[10px] uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary">
                Fotos
              </TabsTrigger>
              <TabsTrigger value="documentos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-[10px] uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary">
                Documentação
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
            <TabsContent value="geral" className="mt-0 space-y-6">
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm overflow-hidden">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-primary" />
                  Sobre a Indústria
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {empresa.apresentacao || "Esta empresa é uma referência industrial na região do Acre, focada em qualidade e inovação."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataCard label="Município" value={`${empresa.municipio}, AC`} icon={<MapPin className="h-4 w-4" />} />
                <DataCard label="Setor Econômico" value={empresa.setor_economico} icon={<Building2 className="h-4 w-4" />} />
                <DataCard label="Segmento" value={empresa.segmento || "Indústria Geral"} icon={<Package className="h-4 w-4" />} />
                <DataCard label="CNPJ" value={empresa.cnpj || "Disponível sob consulta"} />
                <DataCard label="Endereço" value={empresa.endereco || "Não Informado"} className="md:col-span-2" />
                <DataCard label="Contato" value={empresa.telefone || "Entrar em contato via site"} icon={<Phone className="h-4 w-4" />} />
                <DataCard label="E-mail" value={empresa.email || "contato@empresa.com.br"} icon={<Mail className="h-4 w-4" />} />
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="mt-0">
              {empresa.produtos && empresa.produtos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {empresa.produtos.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm group hover:border-primary/30 transition-all duration-300 overflow-hidden">
                      {p.imagem_url && (
                        <div className="w-full h-44 -mx-5 -mt-5 mb-5 overflow-hidden border-b border-slate-100">
                          <img
                            src={p.imagem_url}
                            alt={p.nome}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-bold text-primary/70 border-primary/20 bg-primary/2">
                          {p.linha || "Linha Geral"}
                        </Badge>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      </div>
                      <h5 className="font-bold text-slate-800 mb-2 truncate text-base group-hover:text-primary transition-colors">{p.nome}</h5>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-200">
                  <Package className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-400">Catálogo de produtos em fase de atualização.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fotos" className="mt-0">
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <ImageIcon className="h-3 w-3 text-primary" />
                  Galeria de Imagens
                </h4>
                <ImageGallery images={empresa.arquivos?.filter(a => {
                  const tipo = (a.tipo || '').toLowerCase()
                  const cat = (a.categoria || '').toLowerCase()
                  const url = (a.url || '').toLowerCase()

                  const isImage =
                    tipo.includes('image') ||
                    tipo.includes('imagem') ||
                    cat.includes('imagem') ||
                    cat.includes('foto') ||
                    url.includes('/imagem/') ||
                    /\.(jpg|jpeg|png|webp|gif|avif|jfif|svg)$/i.test(url)

                  return isImage && a.url !== empresa.logo_url
                }) || []} />
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="mt-0">
              {pdfDocs.length > 0 ? (
                <div className="flex flex-col items-center">
                  {/* Seletor de Documentos Minimalista */}
                  {pdfDocs.length > 1 && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 w-full max-w-2xl justify-center scrollbar-hide">
                      {pdfDocs.map((doc, idx) => (
                        <Button
                          key={doc.id}
                          onClick={() => setSelectedDocIndex(idx)}
                          className={`rounded-md h-8 text-[9px] font-bold uppercase tracking-widest px-4 transition-all ${selectedDocIndex === idx
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          {doc.nome.split('.')[0]}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Container Focused do PDF (Igual ao Print) */}
                  <div className="w-full bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden mb-8 relative group">
                    <div className="h-[600px] w-full bg-slate-50">
                      <iframe
                        src={`${pdfDocs[selectedDocIndex].url}#toolbar=0&navpanes=0&view=FitH`}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                      />
                      {/* Overlay minimalista */}
                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-2 shadow-sm">
                        <FileText className="h-3 w-3 text-blue-600" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-700">{pdfDocs[selectedDocIndex].nome}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Download Centralizado (Baseado no Modelo) */}
                  <div className="flex flex-col items-center gap-3">
                    <a
                      href={pdfDocs[selectedDocIndex].url}
                      download={pdfDocs[selectedDocIndex].nome}
                      className="w-full"
                    >
                      <Button className="h-12 px-10 rounded-lg bg-[#1B4332] hover:bg-[#081C15] text-white font-bold uppercase tracking-widest shadow-xl shadow-green-900/20 text-xs transition-all active:scale-95 group">
                        <Download className="mr-3 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                        Baixar PDF
                      </Button>
                    </a>

                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-200">
                  <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-400">Documentação administrativa não disponível.</p>
                </div>
              )}
            </TabsContent>
          </div>

          <div className="bg-white px-8 py-5 flex flex-col md:flex-row items-center justify-between border-t border-slate-200 gap-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50" />
              portfólio da indústria acreana
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none rounded-lg font-bold bg-white h-11 border-slate-200 hover:bg-slate-50 gap-2 text-xs">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button className="flex-1 md:flex-none rounded-lg font-bold h-11 bg-primary hover:bg-primary/90 gap-2 shadow-md shadow-primary/10 text-xs text-white border-none">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function DataCard({ label, value, icon, className }: { label: string, value: string | undefined | null, icon?: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary/20 transition-all duration-300 ${className}`}>
      <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">{label}</span>
      <div className="flex items-center gap-2.5">
        {icon && <div className="text-primary/30 group-hover:text-primary transition-colors">{icon}</div>}
        <p className="text-xs font-bold text-slate-700 truncate capitalize">{value || "Não Informado"}</p>
      </div>
    </div>
  )
}
