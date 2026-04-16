'use client'

import { useState } from "react"
import { MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Empresa } from "@/lib/supabase.types"
import EmpresaDetailsModal from "./EmpresaDetailsModal"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface HomeCompanyCarouselProps {
  empresas: Empresa[]
}

export default function HomeCompanyCarousel({ empresas }: HomeCompanyCarouselProps) {
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)

  return (
    <>
      <div className="relative px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
            breakpoints: {
              '(min-width: 768px)': { slidesToScroll: 2 },
              '(min-width: 1024px)': { slidesToScroll: 3 },
              '(min-width: 1280px)': { slidesToScroll: 6 },
            }
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {empresas.map((empresa) => (
              <CarouselItem key={empresa.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/6">
                <Card className="group overflow-hidden border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white rounded-2xl">
                  <CardHeader className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 relative flex-shrink-0 bg-white rounded-xl border border-border/30 overflow-hidden group-hover:scale-105 transition-transform">
                        {empresa.logo_url ? (
                          <img
                            src={empresa.logo_url}
                            alt={`Logo da ${empresa.nome_fantasia}`}
                            className="w-full h-full object-contain p-2"
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
                        <CardDescription className="text-xs font-medium uppercase tracking-tighter text-muted-foreground">
                          {empresa.setor_economico}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                    <div className="flex items-center text-sm font-medium text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {empresa.municipio}, AC
                    </div>

                    {empresa.telefone && (
                      <div className="flex items-center text-sm font-medium text-muted-foreground mb-4">
                        <Phone className="h-4 w-4 mr-2 text-primary" />
                        {empresa.telefone}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed grow font-medium">
                      {empresa.apresentacao || "Esta indústria contribui para a economia local oferecendo serviços de alta qualidade."}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {empresa.segmento && (
                        <Badge variant="outline" className="text-[10px] h-5 border-primary/20 text-primary bg-primary/5">
                          {empresa.segmento}
                        </Badge>
                      )}
                      {empresa.tema_segmento && (
                        <Badge variant="outline" className="text-[10px] h-5 border-muted text-muted-foreground uppercase tracking-widest">
                          {empresa.tema_segmento}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => setSelectedEmpresa(empresa)}
                      className="w-full bg-muted hover:bg-primary text-foreground hover:text-white border-none shadow-none font-bold transition-all"
                    >
                      Detalhes da Empresa
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 bg-white/80 backdrop-blur-sm border-primary/10 hover:bg-primary hover:text-white transition-all shadow-lg" />
          <CarouselNext className="-right-4 bg-white/80 backdrop-blur-sm border-primary/10 hover:bg-primary hover:text-white transition-all shadow-lg" />
        </Carousel>
      </div>

      <EmpresaDetailsModal
        empresa={selectedEmpresa}
        isOpen={!!selectedEmpresa}
        onClose={() => setSelectedEmpresa(null)}
      />
    </>
  )
}
