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
  Globe,
  Mail,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { buscarEmpresaPorId } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ImageGallery from "@/components/ImageGallery"
import AnalyticsTracker from "@/components/AnalyticsTracker"
import { Empresa } from "@/lib/supabase.types"

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = await params
  const isConfigured = isSupabaseConfigured()

  let empresa: Empresa | null | undefined = null
  let empresasRelacionadas: any[] = []
  
  if (isConfigured) {
    try {
      empresa = await buscarEmpresaPorId(empresaId)
      if (empresa) {
        const todasEmpresas = await import("@/lib/database").then(m => m.buscarEmpresas())
        empresasRelacionadas = todasEmpresas
          .filter((e: any) => 
            e.id !== empresaId && 
            (e.segmento === empresa!.segmento || e.setor_economico === empresa!.setor_economico)
          )
          .slice(0, 6)
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da empresa:", error)
      notFound()
    }
  } else {
    const mockEmpresasModule = await import("@/lib/database")
    const mockEmpresas = await mockEmpresasModule.buscarEmpresas()
    empresa = mockEmpresas.find((emp) => emp.id === empresaId)
    
    if (empresa) {
      empresasRelacionadas = mockEmpresas
        .filter((e) => 
          e.id !== empresaId && 
          (e.segmento === empresa!.segmento || e.setor_economico === empresa!.setor_economico)
        )
        .slice(0, 6)
    }
  }

  if (!empresa) {
    notFound()
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
                  src={empresa.logo_url}
                  alt={`Logo da ${empresa.nome_fantasia}`}
                  className="w-full h-full object-contain p-6"
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
                    {empresa.setor_economico}
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
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-display font-black tracking-tight">Destaques do Portfólio</h2>
                </div>
                <Badge variant="outline" className="font-bold border-muted-foreground/20">
                  {empresa.produtos.length} {empresa.produtos.length === 1 ? 'Produto' : 'Produtos'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {empresa.produtos.map((produto) => (
                  <Card key={produto.id} className="group overflow-hidden border-border/40 bg-white/40 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl">
                    <AnalyticsTracker empresaId={empresa.id} tipoEvento="visualizacao_produto" referenciaId={produto.id} />
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-[9px] uppercase tracking-widest">
                          {produto.linha || "Linha Geral"}
                        </Badge>
                        <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {produto.status === 'ativo' ? (
                            <span className="flex items-center text-green-600">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                              Catálogo
                            </span>
                          ) : 'Indisponível'}
                        </div>
                      </div>
                      <CardTitle className="text-xl font-display font-black group-hover:text-primary transition-colors">
                        {produto.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                        {produto.descricao}
                      </p>
                      
                      {produto.nome_tecnico && (
                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase mb-6 flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          Cod: {produto.nome_tecnico}
                        </div>
                      )}

                      <Button variant="ghost" className="w-full h-11 rounded-xl bg-muted/30 group-hover:bg-primary group-hover:text-white transition-all duration-300 border-none justify-between pl-4 pr-3 font-bold">
                        Ver detalhes técnicos
                        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {empresa.arquivos && empresa.arquivos.filter(a => 
            a.tipo === 'imagem' && 
            a.url !== empresa?.logo_url && 
            a.categoria?.toLowerCase() !== 'logo'
          ).length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-display font-black tracking-tight">Registro Fotográfico</h2>
              </div>
              <div className="glass p-4 rounded-[2.5rem] border-primary/5">
                <ImageGallery images={empresa.arquivos.filter(a => 
                  a.tipo === 'imagem' && 
                  a.url !== empresa?.logo_url && 
                  a.categoria?.toLowerCase() !== 'logo'
                )} />
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Quick Contact Card */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 bg-primary text-white overflow-hidden p-8">
            <h3 className="text-xl font-display font-black mb-6 flex items-center gap-2">
              Canais Diretos
            </h3>
            
            <div className="space-y-6">
              {/* WhatsApp / Phone Simulado ou Real */}
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Atendimento Comercial</p>
                  <p className="font-black text-lg">Entrar em contato</p>
                </div>
              </div>

              {/* Social Links Grid */}
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

          {/* Location & Info */}
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
                  <span className="text-primary truncate ml-4">{empresa.setor_empresa}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Documents Section */}
          {empresa.arquivos && empresa.arquivos.filter(a => a.tipo !== 'imagem').length > 0 && (
            <Card className="rounded-[2.5rem] border-primary/5 bg-slate-50/50 p-8">
              <h3 className="text-lg font-display font-black mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Documentação
              </h3>
              <div className="space-y-4">
                {empresa.arquivos.filter(a => a.tipo !== 'imagem').map(arquivo => (
                  <div key={arquivo.id} className="group relative flex items-center justify-between p-4 bg-white rounded-2xl border border-border/50 hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate max-w-[120px]">{arquivo.nome}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{arquivo.tipo}</p>
                      </div>
                    </div>
                    <a href={arquivo.url} target="_blank" rel="noopener noreferrer">
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

      {/* Related Companies Carrossel */}
      {empresasRelacionadas.length > 0 && (
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
            {empresasRelacionadas.map((relacionada) => (
              <Link key={relacionada.id} href={`/empresas/${relacionada.id}`} className="flex-shrink-0 w-72 group">
                <Card className="h-full border-border/40 hover:border-primary/20 hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col p-6">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-border/50 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                    {relacionada.logo_url ? (
                      <img src={relacionada.logo_url} alt={relacionada.nome_fantasia} className="w-full h-full object-contain p-2" />
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
    </div>
  )
}