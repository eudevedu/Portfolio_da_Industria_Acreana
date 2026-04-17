"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Building2,
  MapPin,
  Package,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  ChevronLeft,
  FileText,
  ImageIcon,
  ExternalLink,
  Plus,
  Phone,
  X,
  Building
} from "lucide-react"
import { resolveImageUrl } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog"
import ImageGallery from "@/components/ImageGallery"
import AnalyticsTracker from "@/components/AnalyticsTracker"
import { buscarCategorias, type Categoria } from "@/lib/services/category-service"
import { useEffect } from "react"

interface EmpresaContentProps {
  initialEmpresa: any
  initialRelacionadas: any[]
}

export default function EmpresaDetailContent({ initialEmpresa, initialRelacionadas }: EmpresaContentProps) {
  const [selectedProduto, setSelectedProduto] = useState<any>(null)
  const [allCategories, setAllCategories] = useState<Categoria[]>([])
  const empresa = initialEmpresa
  const empresasRelacionadas = initialRelacionadas

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await buscarCategorias()
        setAllCategories(data || [])
      } catch (err) {
        console.error("Erro ao carregar categorias:", err)
      }
    }
    loadCategories()
  }, [])

  const getCategoryName = (id: string) => {
    return allCategories.find(c => c.id === id)?.nome || id
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200/50 hover:bg-green-500/20 font-bold">Ativo</Badge>
      case "pendente":
        return <Badge variant="secondary" className="font-bold">Pendente</Badge>
      case "inativo":
        return <Badge variant="destructive" className="font-bold">Inativo</Badge>
      default:
        return <Badge variant="outline" className="font-bold">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnalyticsTracker empresaId={empresa.id} tipoEvento="visualizacao_perfil" />

      {/* Modern Hero Section */}
      <section className="relative pt-12 pb-20 px-4 md:px-8 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-600 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/buscar" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ChevronLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Voltar para a busca
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            {/* Extended Brand Identity */}
            <div className="w-40 h-40 md:w-56 md:h-56 relative flex-shrink-0 bg-white rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
              {empresa.logo_url ? (
                <img
                  src={resolveImageUrl(empresa.logo_url) || empresa.logo_url}
                  alt={`Logo da ${empresa.nome_fantasia}`}
                  className="w-full h-full object-contain p-6"
                  crossOrigin="anonymous"
                />

              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                  <Building2 className="h-20 w-20 text-muted-foreground/20" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left pt-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                {getStatusBadge(empresa.status)}
                {empresa.setor_economico && (
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold uppercase tracking-wider text-[10px]">
                    {getCategoryName(empresa.setor_economico)}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tight text-balance">
                {empresa.nome_fantasia}
              </h1>
              <p className="text-xl text-muted-foreground font-medium mb-6 max-w-2xl">
                {empresa.razao_social}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center text-sm font-bold bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {empresa.municipio}, AC
                </div>
                {empresa.segmento && (
                  <div className="flex items-center text-sm font-bold bg-green-500/5 text-green-700 px-4 py-2 rounded-full border border-green-500/10">
                    <Package className="h-4 w-4 mr-2" />
                    {empresa.segmento}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Details & Products */}
        <div className="lg:col-span-8 space-y-16">
          {/* About Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-black tracking-tight">Sobre a Indústria</h2>
            </div>
            
            <div className="glass p-8 md:p-10 rounded-[2rem] border-primary/5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  Apresentação
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {empresa.apresentacao || "Esta empresa é uma referência industrial na região do Acre, focada em qualidade e inovação."}
                </p>
              </div>

              {empresa.descricao_produtos && (
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full" />
                    Foco Produtivo
                  </h3>
                  <p className="text-base text-muted-foreground/90 leading-relaxed italic">
                    {empresa.descricao_produtos}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Video Player */}
          {empresa.video_apresentacao && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <Youtube className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-display font-black tracking-tight">Experiência Visual</h2>
              </div>
              <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${empresa.video_apresentacao.split("v=")[1]?.split("&")[0] || empresa.video_apresentacao}`}
                  title="Apresentação Institucional"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          )}

          {/* Products Grid */}
          {empresa.produtos && empresa.produtos.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-black tracking-tight">Destaques do Portfólio</h2>
                    <p className="text-sm text-muted-foreground font-medium">Conheça as principais soluções desta indústria</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-black bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full">
                  {empresa.produtos.length} {empresa.produtos.length === 1 ? 'Item' : 'Itens'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {empresa.produtos.filter((p: any) => p !== null).map((produto: any) => (
                  <Card 
                    key={produto.id} 
                    className="group overflow-hidden border-none bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-[2.5rem] flex flex-col cursor-pointer active:scale-95"
                    onClick={() => setSelectedProduto(produto)}
                  >
                    <AnalyticsTracker empresaId={empresa.id} tipoEvento="visualizacao_produto" referenciaId={produto.id} />
                    
                    {/* Product Image Holder */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 p-4">
                      {produto.imagem_url ? (
                        <img 
                          src={resolveImageUrl(produto.imagem_url) || produto.imagem_url} 
                          alt={produto.nome} 
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                          crossOrigin="anonymous"
                        />

                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <ImageIcon className="h-12 w-12 mb-2 stroke-[1.5]" />
                          <span className="text-[10px] uppercase font-bold tracking-widest">Sem imagem</span>
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold text-[9px] uppercase tracking-widest shadow-sm px-3 py-1">
                          {produto.linha || "Geral"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-lg font-display font-black group-hover:text-primary transition-colors leading-tight mb-2">
                          {produto.nome}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
                          {produto.descricao || "Nenhuma descrição detalhada fornecida pela indústria."}
                        </p>
                      </div>
                      
                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                          <div className="flex items-center text-green-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-2" />
                            Em Catálogo
                          </div>
                          {produto.nome_tecnico && (
                            <div className="text-slate-400">
                              REF: {produto.nome_tecnico}
                            </div>
                          )}
                        </div>

                        <Button className="w-full h-12 rounded-2xl bg-slate-50 hover:bg-primary text-slate-900 hover:text-white transition-all duration-300 border-none font-bold text-xs uppercase tracking-widest group/btn">
                          Ver Especificações
                          <Plus className="h-4 w-4 ml-2 transition-transform group-hover/btn:rotate-90" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {empresa.arquivos && empresa.arquivos.filter((a: any) => {
            const tipo = a.tipo?.toLowerCase() || ''
            const cat = a.categoria?.toLowerCase() || ''
            const isImage = tipo.includes('image') || tipo.includes('imagem') || cat.includes('imagem') || ['jpg', 'jpeg', 'png', 'webp'].some(ext => tipo.includes(ext))
            return isImage && a.url !== empresa?.logo_url && cat !== 'logo'
          }).length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-display font-black tracking-tight">Registro Fotográfico</h2>
              </div>
              <div className="glass p-6 rounded-[2.5rem] border-primary/5 shadow-2xl shadow-primary/5">
                <ImageGallery images={empresa.arquivos.filter((a: any) => {
                  const tipo = a.tipo?.toLowerCase() || ''
                  const cat = a.categoria?.toLowerCase() || ''
                  const isImage = tipo.includes('image') || tipo.includes('imagem') || cat.includes('imagem') || ['jpg', 'jpeg', 'png', 'webp'].some(ext => tipo.includes(ext))
                  return isImage && a.url !== empresa?.logo_url && cat !== 'logo'
                })} />
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 bg-primary text-white overflow-hidden p-8">
            <h3 className="text-xl font-display font-black mb-6 flex items-center gap-2">
              Canais Diretos
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Atendimento Comercial</p>
                  <p className="font-black text-lg">Entrar em contato</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {empresa.instagram && (
                  <a href={`https://instagram.com/${empresa.instagram.replace("@", "")}`} target="_blank" className="flex items-center justify-center h-14 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                    <Instagram className="h-6 w-6 group-hover:scale-125 transition-transform" />
                  </a>
                )}
                {empresa.facebook && (
                  <a href={empresa.facebook} target="_blank" className="flex items-center justify-center h-14 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                    <Facebook className="h-6 w-6 group-hover:scale-125 transition-transform" />
                  </a>
                )}
                {empresa.linkedin && (
                  <a href={empresa.linkedin} target="_blank" className="flex items-center justify-center h-14 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                    <Linkedin className="h-6 w-6 group-hover:scale-125 transition-transform" />
                  </a>
                )}
                {empresa.youtube && (
                  <a href={empresa.youtube} target="_blank" className="flex items-center justify-center h-14 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                    <Youtube className="h-6 w-6 group-hover:scale-125 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-border/40 shadow-xl shadow-muted/50 p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Localização Local</h3>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex flex-shrink-0 items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-extrabold text-foreground">{empresa.municipio}, AC</p>
                  <p className="text-sm text-muted-foreground leading-tight mt-1">{empresa.endereco}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Dados Administrativos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground">CNPJ</span>
                  <span className="bg-muted px-2 py-1 rounded-md text-[11px] font-black">{empresa.cnpj}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground">Setor</span>
                  <span className="text-primary truncate ml-4">{getCategoryName(empresa.setor_empresa)}</span>
                </div>
              </div>
            </div>
          </Card>

          {empresa.arquivos && empresa.arquivos.filter((a: any) => {
            const tipo = a.tipo?.toLowerCase() || ''
            return tipo.includes('pdf') || tipo.includes('doc') || tipo.includes('sheet')
          }).length > 0 && (
            <Card className="rounded-[2.5rem] border-primary/10 bg-slate-50/50 p-8 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-display font-black mb-8 flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                Documentação
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {empresa.arquivos.filter((a: any) => {
                  const tipo = a.tipo?.toLowerCase() || ''
                  return tipo.includes('pdf') || tipo.includes('doc') || tipo.includes('sheet')
                }).map((arquivo: any) => (
                  <div key={arquivo.id} className="group relative flex items-center gap-4 p-5 bg-white rounded-3xl border border-border/40 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-slate-900 truncate mb-1">{arquivo.nome}</p>
                      <Badge variant="outline" className="text-[10px] py-0 h-4 font-bold uppercase tracking-wider text-muted-foreground border-muted-foreground/20">
                        {arquivo.categoria || 'Geral'}
                      </Badge>
                    </div>
                    <a href={arquivo.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-blue-100 text-blue-600 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </section>

      {/* Related Companies */}
      {initialRelacionadas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-black tracking-tight text-balance">Explore outras indústrias</h3>
              <p className="text-lg text-muted-foreground font-medium">Segmentos semelhantes ou regionais para você conhecer.</p>
            </div>
            <Link href="/buscar">
              <Button variant="link" className="font-bold p-0 text-primary">
                Ver todo o portfólio <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
              </Button>
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide -mx-4 px-4">
            {initialRelacionadas.map((relacionada) => (
              <Link key={relacionada.id} href={`/empresas/${relacionada.id}`} className="flex-shrink-0 w-72 group">
                <Card className="h-full border-border/40 hover:border-primary/20 hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col p-6">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-border/50 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                    {relacionada.logo_url ? (
                      <img src={resolveImageUrl(relacionada.logo_url) || relacionada.logo_url} alt={relacionada.nome_fantasia} className="w-full h-full object-contain p-2" crossOrigin="anonymous" />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>

                  <h4 className="text-lg font-display font-black truncate mb-2 group-hover:text-primary transition-colors">{relacionada.nome_fantasia}</h4>
                  <div className="flex items-center text-xs font-bold text-muted-foreground/80 mb-6">
                    <MapPin className="h-3 w-3 mr-1" />
                    {relacionada.municipio}, AC
                  </div>
                  <Button variant="ghost" className="mt-auto w-full h-10 rounded-xl bg-muted/50 font-bold justify-between group-hover:bg-primary group-hover:text-white transition-all">
                    Ver perfil
                    <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduto} onOpenChange={() => setSelectedProduto(null)}>
        <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedProduto && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
              <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-12 relative">
                {selectedProduto.imagem_url ? (
                  <img src={resolveImageUrl(selectedProduto.imagem_url) || selectedProduto.imagem_url} alt={selectedProduto.nome} className="max-w-full max-h-[400px] object-contain drop-shadow-2xl" crossOrigin="anonymous" />
                ) : (
                  <Package className="h-32 w-32 text-slate-200" />
                )}

                <div className="absolute top-8 left-8">
                   <Badge className="bg-white/80 backdrop-blur text-slate-900 border-none font-black text-[10px] py-1.5 px-4 rounded-full uppercase tracking-widest">
                     {selectedProduto.linha || "Portfólio Industrial"}
                   </Badge>
                </div>
              </div>

              <div className="md:w-1/2 p-10 md:p-14 flex flex-col bg-white">
                <DialogHeader className="mb-8 p-0">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Ficha Técnica</span>
                     <button onClick={() => setSelectedProduto(null)} className="text-slate-400 hover:text-black transition-colors">
                        <X className="h-5 w-5" />
                     </button>
                  </div>
                  <DialogTitle className="text-3xl md:text-4xl font-display font-black tracking-tight leading-tight">
                    {selectedProduto.nome}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="space-y-3">
                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Descrição do Produto</h4>
                     <p className="text-slate-600 leading-relaxed text-lg">
                       {selectedProduto.descricao || "Esta solução industrial foi desenvolvida com os mais altos padrões de qualidade acreana, focada em eficiência e durabilidade."}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     {selectedProduto.nome_tecnico && (
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Referência / SKU</h4>
                          <p className="font-bold text-slate-900">{selectedProduto.nome_tecnico}</p>
                       </div>
                     )}
                     <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Indústria Responsável</h4>
                        <p className="font-bold text-primary">{empresa.nome_fantasia}</p>
                     </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4">
                  <Button className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                    Solicitar Cotação
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
