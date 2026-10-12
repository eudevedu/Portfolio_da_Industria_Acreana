'use client'

import { useState } from "react"
import { MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Empresa } from "@/lib/supabase.types"
import EmpresaDetailsModal from "./EmpresaDetailsModal"
import { buscarCategorias, type Categoria } from "@/lib/services/category-service"
import { useEffect } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Factory } from "lucide-react"
import { resolveImageUrl } from "@/lib/utils"


interface HomeCompanyCarouselProps {
  empresas: Empresa[]
}

export default function HomeCompanyCarousel({ empresas }: HomeCompanyCarouselProps) {
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [allCategories, setAllCategories] = useState<Categoria[]>([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await buscarCategorias()
        setAllCategories(data || [])
      } catch (err) {
        console.error("Erro ao carregar categorias na home:", err)
      }
    }
    loadCategories()
  }, [])

  const getCategoryName = (id: string) => {
    return allCategories.find(c => c.id === id)?.nome || id
  }

  // Agrupa as empresas em chunks de 6 para exibir em grid de 2x3
  const chunkSize = 6
  const chunks = []
  for (let i = 0; i < empresas.length; i += chunkSize) {
    chunks.push(empresas.slice(i, i + chunkSize))
  }

  if (empresas.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Factory className="h-10 w-10 text-muted-foreground opacity-30" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">Ops! Nenhuma empresa encontrada</h3>
        <p className="text-muted-foreground max-w-md">Não existe empresa cadastrada para esse filtro. Escolha outro segmento ou limpe os filtros para continuar.</p>
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <div className="flex justify-end items-center gap-2 mb-4 pr-1">
            <CarouselPrevious className="static translate-y-0 w-10 h-10 bg-white border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95" />
            <CarouselNext className="static translate-y-0 w-10 h-10 bg-white border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95" />
          </div>
          
          <CarouselContent className="-ml-4 pb-4">
            {chunks.map((chunk, index) => (
              <CarouselItem key={index} className="pl-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chunk.map((empresa) => (
                    <Card key={empresa.id} className="group overflow-hidden border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white rounded-2xl shadow-sm">
                      <CardHeader className="p-5">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-14 h-14 relative flex-shrink-0 bg-white rounded-xl border border-border/30 overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center p-2 shadow-sm">
                            {empresa.logo_url ? (
                              <img
                                src={resolveImageUrl(empresa.logo_url) || empresa.logo_url}
                                alt={`Logo da ${empresa.nome_fantasia}`}
                                className="w-full h-full object-contain"
                              />

                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted/30">
                                <span className="text-lg font-black text-muted-foreground/30">{empresa.nome_fantasia?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                              {empresa.nome_fantasia}
                            </CardTitle>
                            <CardDescription className="text-xs font-semibold uppercase tracking-tight text-muted-foreground/80">
                              {getCategoryName(empresa.setor_economico)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {empresa.municipio}, AC
                        </div>

                        {empresa.telefone && (
                          <div className="flex items-center text-sm font-medium text-muted-foreground mb-3">
                            <Phone className="h-4 w-4 mr-2 text-primary" />
                            {empresa.telefone}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed grow font-medium">
                          {empresa.apresentacao || "Esta indústria contribui para a economia local oferecendo serviços de alta qualidade."}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6 h-12 overflow-hidden items-start">
                          {empresa.segmento && (
                            <Badge variant="outline" className="text-[10px] h-5 border-primary/20 text-primary bg-primary/5">
                              {empresa.segmento}
                            </Badge>
                          )}
                          {empresa.tema_segmento && (
                            <Badge variant="outline" className="text-[10px] h-5 border-muted text-muted-foreground uppercase tracking-widest bg-gray-50/50">
                              {empresa.tema_segmento}
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => setSelectedEmpresa(empresa)}
                          className="w-full bg-muted/60 hover:bg-primary text-foreground hover:text-white border-none shadow-none font-bold transition-all group-hover:shadow-md"
                        >
                          Detalhes da Empresa
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <EmpresaDetailsModal
        empresa={selectedEmpresa}
        isOpen={!!selectedEmpresa}
        onClose={() => setSelectedEmpresa(null)}
        allCategories={allCategories}
      />
    </>
  )
}
