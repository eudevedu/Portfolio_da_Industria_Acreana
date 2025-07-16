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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { buscarEmpresaPorId } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import { notFound } from "next/navigation" // Importa notFound para lidar com empresas não encontradas

export default async function EmpresaDetailPage({ params }: { params: { id: string } }) {
  const empresaId = params.id
  const isConfigured = isSupabaseConfigured()

  let empresa = null
  if (isConfigured) {
    try {
      empresa = await buscarEmpresaPorId(empresaId)
    } catch (error) {
      console.error("Erro ao buscar detalhes da empresa:", error)
      // Em caso de erro na busca, tratamos como não encontrado ou erro genérico
      notFound()
    }
  } else {
    // Modo mock: buscar empresa mock
    const mockEmpresasModule = await import("@/lib/database")
    const mockEmpresas = await mockEmpresasModule.buscarEmpresas()
    empresa = mockEmpresas.find((emp) => emp.id === empresaId)
  }

  if (!empresa) {
    notFound() // Se a empresa não for encontrada (mesmo no mock), renderiza 404
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/buscar" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar para Busca
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">Detalhes da Empresa</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{empresa.nome_fantasia}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-lg">
              {empresa.razao_social} {getStatusBadge(empresa.status)}
            </CardDescription>
            <div className="flex items-center text-gray-600 mt-2">
              <MapPin className="h-5 w-5 mr-2" />
              <span>
                {empresa.municipio}, AC - {empresa.endereco}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">{empresa.setor_economico}</Badge>
              <Badge variant="secondary">{empresa.setor_empresa}</Badge>
              {empresa.segmento && <Badge variant="outline">{empresa.segmento}</Badge>}
              {empresa.tema_segmento && <Badge variant="outline">{empresa.tema_segmento}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Apresentação</h3>
              <p className="text-gray-700 leading-relaxed">{empresa.apresentacao}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Produtos e Serviços</h3>
              <p className="text-gray-700 leading-relaxed">{empresa.descricao_produtos}</p>
            </div>

            {(empresa.instagram || empresa.facebook || empresa.youtube || empresa.linkedin || empresa.twitter) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Redes Sociais</h3>
                  <div className="flex flex-wrap gap-4">
                    {empresa.instagram && (
                      <a
                        href={`https://instagram.com/${empresa.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Instagram className="h-5 w-5" /> Instagram
                      </a>
                    )}
                    {empresa.facebook && (
                      <a
                        href={empresa.facebook.startsWith("http") ? empresa.facebook : `https://${empresa.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Facebook className="h-5 w-5" /> Facebook
                      </a>
                    )}
                    {empresa.youtube && (
                      <a
                        href={empresa.youtube.startsWith("http") ? empresa.youtube : `https://${empresa.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Youtube className="h-5 w-5" /> YouTube
                      </a>
                    )}
                    {empresa.linkedin && (
                      <a
                        href={empresa.linkedin.startsWith("http") ? empresa.linkedin : `https://${empresa.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Linkedin className="h-5 w-5" /> LinkedIn
                      </a>
                    )}
                    {empresa.twitter && (
                      <a
                        href={empresa.twitter.startsWith("http") ? empresa.twitter : `https://${empresa.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Twitter className="h-5 w-5" /> X (Twitter)
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}

            {empresa.video_apresentacao && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Vídeo de Apresentação</h3>
                  <div className="aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${empresa.video_apresentacao.split("v=")[1]?.split("&")[0] || empresa.video_apresentacao}`}
                      title="Vídeo de Apresentação da Empresa"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </>
            )}

            {empresa.produtos && empresa.produtos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Nossos Produtos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {empresa.produtos.map((produto) => (
                      <Card key={produto.id}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-600" /> {produto.nome}
                          </CardTitle>
                          {produto.linha && <CardDescription>{produto.linha}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-3">{produto.descricao}</p>
                          {produto.nome_tecnico && (
                            <p className="text-xs text-gray-500 mt-2">Nome Técnico: {produto.nome_tecnico}</p>
                          )}
                          <Badge variant="outline" className="mt-3">
                            {produto.status === "ativo" ? "Disponível" : "Indisponível"}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {empresa.arquivos && empresa.arquivos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Arquivos e Documentos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {empresa.arquivos.map((arquivo) => (
                      <Card key={arquivo.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {arquivo.tipo === "pdf" ? (
                            <FileText className="h-6 w-6 text-red-500" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-blue-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{arquivo.nome}</p>
                            {arquivo.categoria && (
                              <p className="text-sm text-gray-500">Categoria: {arquivo.categoria}</p>
                            )}
                          </div>
                        </div>
                        <a href={arquivo.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" /> Ver
                          </Button>
                        </a>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="font-bold">Indústrias do Acre</span>
              </div>
              <p className="text-sm text-gray-400">
                Plataforma oficial para o desenvolvimento industrial do Estado do Acre.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresas</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/cadastro">Cadastrar Empresa</Link>
                </li>
                <li>
                  <Link href="/dashboard">Área da Empresa</Link>
                </li>
                <li>
                  <Link href="/buscar">Buscar Empresas</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Setores</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Alimentos</li>
                <li>Madeira</li>
                <li>Construção</li>
                <li>Agropecuária</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <p className="text-sm text-gray-400">
                Governo do Estado do Acre
                <br />
                Secretaria de Indústria e Comércio
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Governo do Estado do Acre. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
