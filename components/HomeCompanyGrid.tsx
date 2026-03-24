'use client'

import { useState } from "react"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Empresa } from "@/lib/supabase.types"
import EmpresaDetailsModal from "./EmpresaDetailsModal"

interface HomeCompanyGridProps {
  empresas: Empresa[]
}

export default function HomeCompanyGrid({ empresas }: HomeCompanyGridProps) {
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {empresas.map((empresa) => (
          <Card key={empresa.id} className="group overflow-hidden border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white rounded-2xl">
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
        ))}
      </div>

      <EmpresaDetailsModal
        empresa={selectedEmpresa}
        isOpen={!!selectedEmpresa}
        onClose={() => setSelectedEmpresa(null)}
      />
    </>
  )
}
