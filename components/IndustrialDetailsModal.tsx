"use client"

import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  X, 
  MapPin, 
  Factory, 
  Package, 
  Phone, 
  Mail, 
  Image as ImageIcon, 
  FileText, 
  Printer, 
  Share2, 
  Building2, 
  Eye,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Empresa } from "@/lib/supabase.types"
import type { Categoria } from "@/lib/services/category-service"
import ImageGallery from "./ImageGallery"

interface IndustrialDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  company: Empresa | null
  allCategories?: Categoria[]
}

export function IndustrialDetailsModal({ isOpen, onClose, company, allCategories = [] }: IndustrialDetailsModalProps) {
  const [selectedDocIndex, setSelectedDocIndex] = React.useState(0)

  // Reset doc index when company changes
  React.useEffect(() => {
    setSelectedDocIndex(0)
  }, [company?.id])

  if (!company) return null

  const pdfDocs = (company.arquivos || []).filter(a => {
    const tipo = (a.tipo || '').toLowerCase()
    const cat = (a.categoria || '').toLowerCase()
    const url = (a.url || '').toLowerCase()
    return tipo.includes('pdf') || url.endsWith('.pdf') || url.includes('/pdf/') || cat.includes('document')
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-none p-0 border-none shadow-2xl bg-white select-none">
        {/* Header Section */}
        <div className="p-8 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                ID {company.id?.substring(0, 8).toUpperCase() || "N/A"}
              </Badge>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {company.nome_fantasia}
              </h2>
            </div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
              {company.razao_social}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest border-none ${
              company.status === 'ativo' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 
              company.status === 'pendente' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 
              'bg-slate-500 text-white shadow-lg shadow-slate-500/20'
            }`}>
              {company.status || "Pendente"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-900">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="geral" className="w-full flex flex-col">
          <div className="px-8 border-b border-slate-100 bg-white sticky top-0 z-10">
            <TabsList className="bg-transparent h-14 p-0 gap-8">
              {['GERAL', 'PRODUTOS', 'FOTOS', 'DOCUMENTAÇÃO'].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase()}
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-600 font-black text-[10px] tracking-widest px-0 transition-all opacity-60 data-[state=active]:opacity-100"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-8 bg-slate-50/30">
            <TabsContent value="geral" className="mt-0 outline-none space-y-6">
              {/* Sobre a Indústria Card */}
              <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4 text-green-600">
                    <Building2 className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sobre a Indústria</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {company.apresentacao || "Nenhuma descrição disponível para esta indústria."}
                  </p>
                </CardContent>
              </Card>

              {/* Grid of Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItemCard label="Município" value={company.municipio || "Não informado"} icon={<MapPin className="h-4 w-4 text-green-500" />} />
                <InfoItemCard 
                  label="Setor Econômico" 
                  value={allCategories.find(c => c.id === company.setor_economico)?.nome || company.setor_economico || "Não informado"} 
                  icon={<Factory className="h-4 w-4 text-green-500" />} 
                />
                <InfoItemCard label="Segmento" value={company.segmento || "Indústria Geral"} icon={<Package className="h-4 w-4 text-green-500" />} />
                <InfoItemCard label="CNPJ" value={company.cnpj || "Não informado"} />
                <InfoItemCard label="Endereço" value={company.endereco || "Endereço não informado"} className="md:col-span-2" />
                <InfoItemCard label="Contato" value={company.instagram ? `Instagram: @${company.instagram}` : "Entrar em contato via site"} icon={<Phone className="h-4 w-4 text-green-500" />} />
                <InfoItemCard label="E-mail" value={company.email || "contato@empresa.com.br"} icon={<Mail className="h-4 w-4 text-green-500" />} className="md:col-span-2" />
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="mt-0 outline-none space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.produtos && company.produtos.length > 0 ? (
                  company.produtos.map((produto) => (
                    <Card key={produto.id} className="rounded-2xl border-slate-100 shadow-sm overflow-hidden group hover:border-green-200 transition-all">
                      <div className="aspect-video relative bg-slate-100">
                        {produto.imagem_url ? (
                          <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                        <Badge className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 border-none font-bold text-[9px] uppercase">
                          {produto.linha || "Geral"}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-black text-slate-900 text-sm mb-1">{produto.nome}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {produto.descricao || "Sem descrição disponível."}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center space-y-3 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Package className="h-10 w-10 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nenhum produto cadastrado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="fotos" className="mt-0 outline-none">
              <ImageGallery images={company.arquivos?.filter(a => {
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

                return isImage && a.url !== company.logo_url
              }) || []} />
            </TabsContent>

            <TabsContent value="documentação" className="mt-0 outline-none">
              {pdfDocs.length > 0 ? (
                <div className="flex flex-col items-center">
                  {/* Document Selector */}
                  {pdfDocs.length > 1 && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 w-full justify-center scrollbar-hide">
                      {pdfDocs.map((doc, idx) => (
                        <Button
                          key={doc.id}
                          onClick={() => setSelectedDocIndex(idx)}
                          className={`rounded-xl h-9 text-[10px] font-black uppercase tracking-widest px-6 transition-all ${selectedDocIndex === idx
                            ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                            : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                          }`}
                        >
                          {doc.nome.split('.')[0]}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* PDF Preview Container */}
                  <Card className="w-full bg-white rounded-[2rem] border-slate-100 shadow-xl overflow-hidden mb-6 relative group border-none">
                    <div className="h-[600px] w-full bg-slate-50 relative">
                      <iframe
                        src={`${pdfDocs[selectedDocIndex].url}#toolbar=0&navpanes=0&view=FitH`}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                      />
                      {/* Floating Info */}
                      <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xl">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{pdfDocs[selectedDocIndex].nome}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Actions for the selected doc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    <Button variant="outline" className="h-12 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest gap-2 bg-white" asChild>
                      <a href={pdfDocs[selectedDocIndex].url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Abrir em nova aba
                      </a>
                    </Button>
                    <Button className="h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-slate-900/20" asChild>
                      <a href={pdfDocs[selectedDocIndex].url} download={pdfDocs[selectedDocIndex].nome}>
                        <FileText className="h-4 w-4" />
                        Baixar Documento
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-3 bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <FileText className="h-12 w-12 text-slate-200 mx-auto" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sem documentação disponível</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Modal Footer */}
        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Portfólio da Indústria Acreana</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-12 px-8 font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-slate-50 gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button className="rounded-xl h-12 px-8 font-black text-xs uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoItemCard({ label, value, icon, className }: { label: string, value: string, icon?: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("rounded-2xl border-slate-100 shadow-sm bg-white overflow-hidden group hover:border-green-200 transition-all", className)}>
      <CardContent className="p-6">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2 block">{label}</label>
        <div className="flex items-center gap-3">
          {icon && <div className="group-hover:scale-110 transition-transform">{icon}</div>}
          <p className="text-sm font-black text-slate-800 tracking-tight leading-snug">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
